import { role } from './_role';

async function system(hidden: boolean = false, _parser_context: any = null): Promise<any> {
  return await role({ name: 'system', hidden, _parser_context });
};
