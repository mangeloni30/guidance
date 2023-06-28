interface ParserContext {
  block_content: any[];
  variable_stack: any[];
  parser: any;
}

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export async function if_(value: boolean, invert = false, _parser_context: ParserContext | null = null): Promise<any> {
  const block_content = _parser_context!.block_content;
  const variable_stack = _parser_context!.variable_stack;
  assert(block_content.length === 1 || block_content.length === 3, "Expected block content length to be either 1 or 3"); // we don't support elseif yet...
  const options: any[] = [block_content[0]];

  for (let i = 1; i < block_content.length; i += 2) {
    assert(
      /{{~?else~?}}/.test(block_content[i].text),
      "Expected else statement"
    );
    options.push(block_content[i + 1]);
  }

  if (invert) {
    value = !value;
  }

  if (value) {
    return await _parser_context!.parser.visit(options[0], variable_stack);
  } else if (options.length > 1) {
    return await _parser_context!.parser.visit(options[1], variable_stack);
  } else {
    return "";
  }
};
