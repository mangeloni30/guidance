import { parserObject } from "../grammar";
import { stripMarkers } from "../utils";

interface ParserContext {
  parser: any;
}

/**
 * @description
 * Parse a string as a guidance program.
    This is useful for dynamically generating and then running guidance programs (or parts of programs).
    Parameters
    ----------
 * @param {String} string str The string to parse.
 * @param {String} name The name of the variable to set with the generated content.
 * @param {ParserContext} _parser_context
 * @returns 
 */
export async function parse(string: string, name: string | null = null, _parser_context: ParserContext | null = null): Promise<any> {
  const parser = _parser_context!.parser;
  const pos = parser.prefix.length;
  // parse the string
  const subtree = parserObject.feed(string);
  const out = await parser.visit(subtree);

  if (name !== null) {
    const new_content = parser.prefix.slice(pos);
    parser.set_variable(name, stripMarkers(new_content));
  }

  return out;
};
