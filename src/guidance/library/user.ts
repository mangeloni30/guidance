import { role } from "./role";

export async function user(hidden: boolean = false, _parser_context: any = null): Promise<any> {
  return await role("user", hidden, _parser_context);
};
