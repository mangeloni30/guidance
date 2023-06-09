export async function await_(name: string, _parser_context: any = null): Promise<any> {
  // stop the program completion if we are waiting for a value to be set
  // this will result in a partially completed program that we can then finish
  // later (by calling it again with the variable we need)
  const parser = _parser_context['parser'];
  if (!(name in parser.program)) {
    parser.executing = false;
  } else {
    const value = parser.program[name];
    delete parser.program[name];
    return value;
  }

  // const cache = parser.program._await_cache;
  // while (!(name in cache)) {
  //   parser.program.finish_execute(); // allow the program to finish the current call (since we're waiting for a value from the next call now)
  //   // TODO: instead of waiting here, we should just single we are stopping the program completion here
  //   //       and then let all the containing elements record their state into a new program string that
  //   //       we can then use to continue the program completion later in a new object.
  //   cache[name] = await parser.program._await_queue.get();
  //   // pass
  // }
  // const value = cache[name];
  // delete cache[name];
  // return value;
};
