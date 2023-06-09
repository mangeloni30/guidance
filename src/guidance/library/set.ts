interface ParserContext {
  parser: any;
  variable_stack: any;
}

export function set(name: string | Record<string, any>, value?: string, hidden?: boolean, _parser_context?: ParserContext): string {
  const parser = _parser_context['parser'];
  const variable_stack = _parser_context['variable_stack'];

  if (!parser.executing) {
    return "";
  }

  if (typeof name === 'object') {
    assert(hidden !== false, "hidden cannot be false if setting multiple variables!");

    for (const [k, v] of Object.entries(name)) {
      variable_stack[k] = v;
    }

    let out = "";
    for (const [k, v] of Object.entries(name)) {
      if (typeof v === 'string') {
        if (v.includes('\n')) {
          v = `"""${v}"""`;
        } else if (v.includes('"')) {
          v = `'${v}'`;
        } else {
          v = `"${v}"`;
        }
      }
      out += ` ${k}=${v}`;
    }
    out += "";
    return `{{!--GMARKER_set$${out}$--}}`;
  } else {
    variable_stack[name] = value;
    if (hidden !== true) {
      return value;
    } else {
      const out = `{{set ${name}=${String(value)}}}`;
      return `{{!--GMARKER_set$${out}$--}}`;
    }
  }
};
