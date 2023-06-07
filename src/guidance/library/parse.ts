// from .._utils import strip_markers
// from .._grammar import grammar

async function parse(string: string, name: string | null = null, _parser_context: any = null): Promise<any> {
  /**
   * Parse a string as a guidance program.
   *
   * This is useful for dynamically generating and then running guidance programs (or parts of programs).
   *
   * @param string - The string to parse.
   * @param name - The name of the variable to set with the generated content.
   */

  const parser = _parser_context['parser'];
  const pos = parser.prefix.length;
  // parse the string
  const subtree = grammar.parse(string);
  const out = await parser.visit(subtree);

  if (name !== null) {
    const new_content = parser.prefix.slice(pos);
    parser.set_variable(name, strip_markers(new_content));
  }

  return out;
};
