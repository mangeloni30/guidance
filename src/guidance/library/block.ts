import { ContentCapture } from "../utilsReplicate/index";

/**
 * @method block
 *  Generic block-level element.
 * @description This is useful for naming or hiding blocks of content. 
 * @param name The name of the block. A variable with this name will be set with the generated block content. 
 * @param hidden Whether to include the generated block content in future LLM context.
 * @param _parser_context 
 */
export async function block(name: string | null = null, hidden: boolean = false, _parser_context: any = null): Promise<any> {
  const parser = _parser_context['parser'];
  const variable_stack = _parser_context['variable_stack'];

  // capture the content of the block
  const new_content = new ContentCapture(variable_stack, hidden);
  // try {
  //   // visit the block content
  //   new_content.append(await parser.visit(
  //     _parser_context['block_content'][0],
  //     variable_stack,
  //     {
  //       next_node: _parser_context["next_node"],
  //       next_next_node: _parser_context["next_next_node"],
  //       prev_node: _parser_context["prev_node"]
  //     }
  //   ));

  //   // set the variable if needed
  //   if (name !== null) {
  //     const variable_value = new_content.toString();
  //     variable_stack[name] = variable_value;
  //   }
  // } finally {
  //   new_content.close();
  // }
};

