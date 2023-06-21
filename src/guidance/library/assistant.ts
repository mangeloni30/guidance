import { role } from "./role";
export async function assistant(hidden: boolean = false, _parser_context: any = null): Promise<any> {
  return await role("assistant", hidden, _parser_context);
};

