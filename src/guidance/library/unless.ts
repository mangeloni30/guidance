import { if_ } from './_if';

export async function unless(value: any, _parser_context: any = null): Promise<any> {
  return await if_(value, { invert: true, _parser_context });
};
