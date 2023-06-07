// import itertools
// import pygtrie
// import numpy as np

/**
 * Select a value from a list of choices.
 * @method select
 * @param variable_name - The name of the variable to set with the selected value.
 * @param options - An optional list of options to select from. This argument is only used when select is used in non-block mode.
 * @param logprobs - An optional variable name to set with the logprobs for each option. If this is set the log probs of every option is fully evaluated. When this is null (the default) we use a greedy max approach to select the option (similar to how greedy decoding works in a language model). So in some cases the selected option can change when logprobs is set since it will be more like an exhaustive beam search scoring than a greedy max scoring.
 * @param list_append - Whether to append the generated value to a list stored in the variable. If set to true, the variable must be a list, and the generated value will be appended to the list.
 */
async function select(
  variable_name: string = "selected",
  options: string[] | null = null,
  logprobs: string | null = null,
  list_append: boolean = false,
  _parser_context: any = null): Promise<void> {
  const parser = _parser_context['parser'];
  const block_content = _parser_context['block_content'];
  const variable_stack = _parser_context['variable_stack'];
  const next_node = _parser_context["next_node"];
  const next_next_node = _parser_context["next_next_node"];

  if (block_content === null) {
    if (options === null) {
      throw new Error("You must provide an options list like: {{select 'variable_name' options}} when using the select command in non-block mode.");
    }
  } else {
    if (block_content.length <= 1) {
      throw new Error("You must provide at least two options to the select block command.");
    }
    if (options !== null) {
      throw new Error("You cannot provide an options list when using the select command in block mode.");
    }
  }

  if (options === null) {
    options = [block_content[0].text];
    for (let i = 1; i < block_content.length; i += 2) {
      if (block_content[i].text !== "{{or}}") {
        throw new Error("Expected '{{or}}' statement");
      }
      options.push(block_content[i + 1].text);
    }
  }

  let next_text = next_node ? next_node.text : "";
  if (next_next_node && next_next_node.text.startsWith("{{~")) {
    next_text = next_text.trim();
    if (next_text === "") {
      next_text = next_next_node.text;
    }
  }
  if (next_text === "") {
    next_text = parser.program.llm.end_of_text();
  }
  options = options.map(option => option + next_text);

  // TODO: this retokenizes the whole prefix many times, perhaps this could become a bottleneck?
  const options_tokens = options.map(option => parser.program.llm.encode(variable_stack["prefix"] + option));

  const recoded_parser_prefix_length = parser.program.llm.decode(parser.program.llm.encode(variable_stack["prefix"])).length;

  const token_map = new pygtrie.Trie();
  for (let i = 0; i < options_tokens.length; i++) {
    token_map.put(options_tokens[i], i);
  }

  async function recursive_select(current_prefix: number[], allow_token_extension: boolean = true): Promise<{ [key: number]: number }> {
    const extension_options = token_map.keys(current_prefix);
    const logprobs_out: { [key: number]: number } = {};

    if (extension_options.length === 1) {
      logprobs_out[extension_options[0]] = 0;
      return logprobs_out;
    } else {
      let match_index = current_prefix.length;
      for (let i = current_prefix.length; i < Math.min(...extension_options.map(option => option.length)); i++) {
        const unique_chars = new Set(extension_options.map(option => option[i]));
        if (unique_chars.size > 1) {
          break;
        }
        match_index++;
      }
      if (match_index > current_prefix.length) {
        current_prefix = current_prefix.concat(extension_options[0].slice(current_prefix.length, match_index));
      }
    }

    const logit_bias: { [key: number]: number } = {};
    for (const option_tokens of extension_options) {
      logit_bias[option_tokens[match_index]] = 100;
    }

    if (Object.keys(logit_bias).length === 0 && extension_options.includes(current_prefix)) {
      logprobs_out[current_prefix] = 0;
      return logprobs_out;
    }

    const gen_obj = await parser.llm_session(
      parser.program.llm.decode(current_prefix),
      1,
      logit_bias,
      logit_bias.length,
      0,
      false
    );
    const top_logprobs: { [key: number]: number } = {};
    if ("logprobs" in gen_obj) {
      const logprobs_result = gen_obj["logprobs"];
      for (const [k, v] of Object.entries(logprobs_result["top_logprobs"][0])) {
        const id = parser.program.llm.token_to_id(k);
        top_logprobs[id] = v;
      }
    } else {
      assert(logprobs === null, "You cannot ask for the logprobs in a select call when using a model that does not return logprobs!");
      top_logprobs[parser.program.llm.token_to_id(gen_obj["text"])] = 0;
    }

    if (logprobs === null) {
      const max_key = Object.keys(top_logprobs).reduce((a, b) => top_logprobs[a] > top_logprobs[b] ? a : b);
      top_logprobs[max_key] = top_logprobs[max_key];
    }

    for (const [token, logprob] of Object.entries(top_logprobs)) {
      const sub_logprobs = await recursive_select(current_prefix.concat([Number(token)]));
      for (const k in sub_logprobs) {
        const p1 = Math.exp(logprobs_out[k]);
        const p2 = Math.exp(sub_logprobs[k] + logprob);
        const or_prob = p1 + p2 - p1 * p2;
        logprobs_out[k] = Math.log(or_prob);
      }
    }

    return logprobs_out;
  }

  const option_logprobs = await recursive_select([]);

  const option_logprobs_decoded = Object.fromEntries(
    Object.entries(option_logprobs).map(([k, v]) => [
      parser.program.llm.decode(k).slice(recoded_parser_prefix_length, -next_text.length),
      v,
    ])
  );

  const selected_option = Object.keys(option_logprobs_decoded).reduce((a, b) => option_logprobs_decoded[a] > option_logprobs_decoded[b] ? a : b);

  if (list_append) {
    const value_list = variable_stack[variable_name] || [];
    value_list.push(selected_option);
    variable_stack[variable_name] = value_list;
    if (logprobs !== null) {
      const logprobs_list = variable_stack[logprobs] || [];
      logprobs_list.push(option_logprobs_decoded);
      variable_stack[logprobs] = logprobs_list;
    }
  } else {
    variable_stack[variable_name] = selected_option;
    if (logprobs !== null) {
      variable_stack[logprobs] = option_logprobs_decoded;
    }
  }

  if (Math.max(...Object.values(option_logprobs_decoded)) <= -1000) {
    throw new Error("No valid option generated in #select! Please post a GitHub issue since this should not happen :)");
  }

  variable_stack["_prefix"] += selected_option;
}

