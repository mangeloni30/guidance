// from .._utils import strip_markers, ContentCapture

export async function role(name: string, hidden: boolean = false, _parser_context: any = null): Promise<string> {
  /**
   * A chat role block.
   *
   * @param name - The name of the role.
   * @param hidden - Boolean indicating if the role is hidden.
   */

  const block_content = _parser_context['block_content'];
  const parser = _parser_context['parser'];
  const variable_stack = _parser_context['variable_stack'];

  // capture the content of the block
  const new_content = new ContentCapture(variable_stack, hidden);
  
  // send the role-start special tokens
  new_content += parser.program.llm.role_start(name);

  // visit the block content
  new_content += await parser.visit(
    block_content[0],
    variable_stack,
    { next_node: _parser_context["block_close_node"], prev_node: _parser_context["prev_node"], next_next_node: _parser_context["next_node"] }
  );

  // send the role-end special tokens
  new_content += parser.program.llm.role_end(name);

  return new_content;
}

role.is_block = true;

