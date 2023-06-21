import { ContentCapture } from "../utilsReplicate";

export async function each(list: Iterable<any>, hidden: boolean = false, parallel: boolean = false, _parser_context: any = null): Promise<any[]> {
  const block_content = _parser_context.block_content;
  const parser = _parser_context.parser;
  const variable_stack = _parser_context.variable_stack;

  if (!(parallel || hidden === true)) {
    throw new Error("parallel=true is only compatible with hidden=true (since if hidden=false earlier items are context for later items)");
  }

  if (!(Symbol.iterator in list)) {
    throw new TypeError("The #each command cannot iterate over a non-iterable value: " + String(list));
  }
  
  const array = Array.from(list); // Convert Iterable to an array

  if (parallel) {
    const out: any[] = [];
    const coroutines: Promise<any>[] = [];

    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      variable_stack.push({
        "@index": i,
        "@first": i === 0,
        "@last": i === array.length - 1,
        "this": item,
        "_prefix": variable_stack["_prefix"], // create a local copy of the prefix since we are hidden
        "_no_display": true
      });

      coroutines.push(
        parser.visit(
          block_content[0],
          variable_stack.copy(),
          {
            next_node: _parser_context.next_node,
            next_next_node: _parser_context.next_next_node,
            prev_node: _parser_context.prev_node
          }
        )
      );

      variable_stack.pop();
    }

    await Promise.all(coroutines);

    return out;
  } else {
    // try {
    //   iter(list);
    // } catch (error) {
    //   throw new TypeError("The #each command cannot iterate over a non-iterable value: " + String(list));
    // }

    const out: any[] = [];

    const array = Array.from(list);
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      variable_stack.push({
          "@index": i,
          "@first": i === 0,
          "@last": i === array.length - 1,
          "this": item
      });
      const newContentCapture = new ContentCapture(variable_stack, hidden);
      try {
        newContentCapture.iadd({
          block_content: block_content[0],
          variable_stack,
          next_node: _parser_context.next_node,
          next_next_node: _parser_context.next_next_node,
          prev_node: _parser_context.prev_node
        });
        // newContentCapture += await parser.visit(
        //     block_content[0],
        //     variable_stack,
        //     {
        //       next_node: _parser_context.next_node,
        //       next_next_node: _parser_context.next_next_node,
        //       prev_node: _parser_context.prev_node
        //     }
        // );
        out.push(String(newContentCapture));
      } finally {
        variable_stack.pop();
      }
      if (parser.caught_stop_iteration) {
        parser.caught_stop_iteration = false;
        break;
      }
    }
    return out;
  }
};
