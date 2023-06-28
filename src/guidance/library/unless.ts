import { if_ } from "./if";

export async function unless(value: any, _parser_context: any = null): Promise<any> {
  return await if_(value, true, _parser_context);
};
