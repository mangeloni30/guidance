// import inspect
// import re
// import uuid
// import asyncio
// from .._utils import ContentCapture

export async function each(list: Iterable<any>, hidden: boolean = false, parallel: boolean = false, _parser_context: any = null): Promise<void> {
  const block_content = _parser_context['block_content'];
  const parser = _parser_context['parser'];
  const variable_stack = _parser_context['variable_stack'];

  if (parallel) {
    assert(hidden === true, "parallel=true is only compatible with hidden=true (since if hidden=false, earlier items are context for later items)");
  
    const coroutines: Promise<void>[] = [];
    let i = 0;
    for (const item of list) {
      variable_stack.push({
        "@index": i,
        "@first": i === 0,
        "@last": i === list.length - 1,
        "this": item,
        "_prefix": variable_stack["_prefix"],
        "_no_display": true
      });

      const coroutine = parser.visit(
        block_content[0],
        variable_stack.copy(),
        {
          next_node: _parser_context["next_node"],
          next_next_node: _parser_context["next_next_node"],
          prev_node: _parser_context["prev_node"]
        }
      );
      coroutines.push(coroutine);

      variable_stack.pop();
      i++;
    }

    await Promise.all(coroutines);
  } else {
    let i = 0;
    for (const item of list) {
      variable_stack.push({
        "@index": i,
        "@first": i === 0,
        "@last": i === list.length - 1,
        "this": item
      });

      const new_content = new ContentCapture(variable_stack, hidden);
      new_content += await parser.visit(
        block_content[0],
        variable_stack,
        {
          next_node: _parser_context["next_node"],
          next_next_node: _parser_context["next_next_node"],
          prev_node: _parser_context["prev_node"]
        }
      );
      out.push(new_content.toString());

      if (parser.caught_stop_iteration) {
        parser.caught_stop_iteration = false;
        break;
      }

      variable_stack.pop();
      i++;
    }
  }
}

each.is_block = true;
