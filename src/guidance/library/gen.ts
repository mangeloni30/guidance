import * as asyncio from 'async_hooks';
import * as re from 're';
import * as uuid from 'uuid';
import * as logging from 'logging';
import { AsyncIter } from '../_utils';
import { grammar } from '../_grammar';

// const log = logging.getLogger(__name__);

/**
 * @method gen
 * Use the LLM to generate a completion
 * @param name The name of a variable to store the generated value in. If none the value is just returned
 * @param stop The stop string to use for stopping generation. If not provided, the next node's text will be used if
    that text matches a closing quote, XML tag, or role end. Note that the stop string is not included in
    the generated value.
 * @param stop_regex A regular expression to use for stopping generation. If not provided, the stop string will be used.
 * @param save_stop_text If set to a string, the exact stop text used will be saved in a variable with the given name. If set to
    True, the stop text will be saved in a variable named `name+"_stop_text"`. If set to False,
    the stop text will not be saved.
 * @param max_tokens The maximum number of tokens to generate in this completion
 * @param n The number of completions to generate. If you generate more than one completion, the variable will be
    set to a list of generated values. Only the first completion will be used for future context for the LLM,
    but you may often want to use hidden=True when using n > 1
 * @param stream 
 * @param temperature The temperature to use for generation. A higher temperature will result in more random completions. Note
    that caching is always on for temperature=0, and is seed-based for other temperatures
 * @param top_p The top_p value to use for generation. A higher top_p will result in more random completions.
 * @param logprobs If set to an integer, the LLM will return that number of top log probabilities for the generated tokens
    which will be stored in a variable named `name+"_logprobs"`. If set to None, the log
    probabilities will not be returned.
 * @param pattern A regular expression pattern guide to use for generation. If set the LLM will be forced (through guided
    decoding) to only generate completions that match the regular expression.
 * @param hidden Whether to hide the generated value from future LLM context. This is useful for generating completions
    that you just want to save in a variable and not use for future context
 * @param list_append Whether to append the generated value to a list stored in the variable. If set to True, the variable
    must be a list, and the generated value will be appended to the list.
 * @param save_prompt If set to a string, the exact prompt given to the LLM will be saved in a variable with the given name
 * @param token_healing If set to a bool this overrides the token_healing setting for the LLM.
 * @param _parser_context 
 * @param llm_kwargs Any other keyword arguments will be passed to the LLM __call__ method. This can be useful for setting
    LLM-specific parameters like `repetition_penalty` for Transformers models or `suffix` for some OpenAI models.
 */
export async function gen(
  name: string | null = null,
  stop: string | null = null,
  stop_regex: string | null = null,
  save_stop_text: string | boolean = false,
  max_tokens: number = 500,
  n: number = 1,
  stream: any = null,
  temperature: number = 0.0,
  top_p: number = 1.0,
  logprobs: number | null = null,
  pattern: string | null = null,
  hidden: boolean = false,
  list_append: boolean = false,
  save_prompt: string | boolean = false,
  token_healing: boolean | null = null,
  _parser_context: any = null,
  ...llm_kwargs: any): Promise<void> {

  const prefix: string = '';
  const suffix: string = '';

  // get the parser context variables we will need
  const parser = _parser_context["parser"];
  const variable_stack = _parser_context["variable_stack"];
  const next_node = _parser_context["next_node"];
  const next_next_node = _parser_context["next_next_node"];
  const prev_node = _parser_context["prev_node"];
  const pos = variable_stack["_prefix"].length; // save the current position in the prefix

  if (hidden) {
    variable_stack.push({ "_prefix": variable_stack["_prefix"] });
  }

  if (list_append) {
    if (name === null) {
      throw new Error("You must provide a variable name when using list_append=True");
    }
  }

  // if stop is null then we use the text of the node after the generate command
  if (stop === null) {
    let next_text = (next_node !== null) ? next_node.text : '';
    let prev_text = (prev_node !== null) ? prev_node.text : '';

    if (next_next_node !== null && next_next_node.text.startsWith("{{~")) {
      next_text = next_text.trim();
      if (next_next_node && next_text === "") {
        next_text = next_next_node.text;
      }
    }

    // auto-detect quote stop tokens
    const quote_types = ["'''", '"""', '```', '"', "'", "`"];
    for (const quote_type of quote_types) {
      if (next_text.startsWith(quote_type) && prev_text.endsWith(quote_type)) {
        stop = quote_type;
        break;
      }
    }

    // auto-detect role stop tags
    if (stop === null) {
      const m = re.match(/^{{~?\/(user|assistant|system|role)~?}}.*/, next_text);
      if (m !== null) {
        stop = parser.program.llm.role_end(m.group(1));
      }
    }

    // auto-detect XML tag stop tokens
    if (stop === null) {
      const m = re.match(/^<([^>\W]+)[^>]+>/, next_text);
      if (m !== null) {
        const end_tag = "</" + m.group(1) + ">";
        if (next_text.startsWith(end_tag)) {
          stop = end_tag;
        }
      }
    }
  }

  if (stop === "") {
    stop = null;
  }

  // set the cache seed to 0 if temperature is 0
  let cache_seed: number;
};
