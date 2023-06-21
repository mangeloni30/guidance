import { ContentCapture } from "../utilsReplicate/index";

export async function role(
  name: string,
  hidden: boolean = false,
  parserContext: any = null
): Promise<string> {
  const block_content = parserContext['block_content'];
  const parser = parserContext['parser'];
  const variable_stack = parserContext['variable_stack'];

  // Capture the content of the block
  const newContent: string[] = [];
  const contentCapture = new ContentCapture(variable_stack, hidden);
  // contentCapture.start();

  try {
    // Send the role-start special tokens
    newContent.push(parser.program.llm.role_start(name));

    // Visit the block content
    newContent.push(
      await parser.visit(
        block_content[0],
        variable_stack,
        parserContext['block_close_node'],
        parserContext['prev_node'],
        parserContext['next_node']
      )
    );

    // Send the role-end special tokens
    newContent.push(parser.program.llm.role_end(name));
  } finally {
    // contentCapture.stop();
  }

  return newContent.join('');
}
