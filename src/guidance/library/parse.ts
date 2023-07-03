import * as peg from 'pegjs';
import { grammar } from "../grammar";
import { stripMarkers } from "../utils";

interface ParserContext {
  parser: any;
}

/**
 * @description
 * Parse a string as a guidance program.
    This is useful for dynamically generating and then running guidance programs (or parts of programs).
 * @param {String} string the string to parse.
 * @param {String} name the name of the variable to set with the generated content.
 * @param {ParserContext} _parser_context
 * @returns 
 */
export async function parse(string: string, name: string | null = null, _parser_context: ParserContext | null = null): Promise<any> {
  const parser = _parser_context!.parser;
  const pos = parser.prefix.length;
  const pegParser = peg.generate(grammar);
  const subtree = pegParser.parse(string);
  const out = subtree; // await parser.visit(subtree);

  if (name !== null) {
    const new_content = parser.prefix.slice(pos);
    parser.set_variable(name, stripMarkers(new_content));
  }

  return out;
};
