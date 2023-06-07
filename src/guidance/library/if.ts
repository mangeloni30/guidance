// import re

async function if_(value: boolean, invert: boolean = false, _parser_context: any = null): Promise<string> {
  /**
   * Standard if/else statement.
   *
   * Parameters
   * ----------
   * value : boolean
   *     The value to check. If `true` then the first block will be executed, otherwise the second block
   *     (the one after the `{{else}}`) will be executed.
   * invert : boolean
   *     If `true` then the value will be inverted before checking.
   */

  const block_content = _parser_context['block_content'];
  const variable_stack = _parser_context['variable_stack'];
  assert(block_content.length === 1 || block_content.length === 3, "Expected 1 or 3 block contents"); // we don't support elseif yet...

  const options = [block_content[0]];
  for (let i = 1; i < block_content.length; i += 2) {
    assert(block_content[i].text.match(/{{~?else~?}}/), "Expected else statement");
    options.push(block_content[i + 1]);
  }

  if (invert) {
    value = !value;
  }

  if (value) {
    return await _parser_context['parser'].visit(options[0], variable_stack);
  } else if (options.length > 1) {
    return await _parser_context['parser'].visit(options[1], variable_stack);
  } else {
    return "";
  }
}

if_.is_block = true;

