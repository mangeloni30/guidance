// from ._role import role

async function assistant(hidden: boolean = false, _parser_context: any = null): Promise<any> {
  return await role({ name: "assistant", hidden: hidden, _parser_context: _parser_context });
}
assistant.is_block = true;
