import { role } from "./role";

export async function system(hidden: boolean = false, _parser_context: any): Promise<any> {
  return await role("system", hidden, _parser_context);
};
