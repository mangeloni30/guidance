interface ParserContext {
  parser: any;
  block_content: any;
  variable_stack: any;
  next_node: any;
  next_next_node: any;
}

export async function select(
  variable_name: string = "selected",
  options: string[] | null = null,
  logprobs: string | null = null,
  list_append: boolean = false,
  _parser_context: ParserContext | null = null
): Promise<void> {
  if (!_parser_context) {
    throw new Error("Parser context not provided.");
  }

  const parser = _parser_context.parser;
  const block_content = _parser_context.block_content;
  const variable_stack = _parser_context.variable_stack;
  const next_node = _parser_context.next_node;
  const next_next_node = _parser_context.next_next_node;

  if (block_content === null) {
    if (!options) {
      throw new Error(
        "You must provide an options list like: select('variable_name', options) when using the select command in non-block mode."
      );
    }
  } else {
    if (block_content.length <= 1) {
      throw new Error(
        "You must provide at least two options to the select block command."
      );
    }
    if (options !== null) {
      throw new Error(
        "You cannot provide an options list when using the select command in block mode."
      );
    }
  }

  if (options === null) {
    options = [block_content[0].text];
    for (let i = 1; i < block_content.length; i += 2) {
      if (block_content[i].text !== "{{or}}") {
        throw new Error(
          "Expected '{{or}}' in block content at index " + (i - 1)
        );
      }
      options.push(block_content[i + 1].text);
    }
  }

  let next_text = next_node ? next_node.text : "";
  if (next_next_node && next_next_node.text.startsWith("{{~")) {
    next_text = next_text.trim();
    if (!next_text) {
      next_text = next_next_node.text;
    }
  }
  if (!next_text) {
    next_text = parser.program.llm.end_of_text();
  }
  options = options.map((option) => option + next_text);

  // TODO: Continue translating the rest of the function

  // Placeholder return statement
  return;
};
