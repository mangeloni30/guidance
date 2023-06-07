import { role } from './_role';

async function user(hidden: boolean = false, _parser_context: any = null): Promise<any> {
  return await role({ name: 'user', hidden, _parser_context });
};
