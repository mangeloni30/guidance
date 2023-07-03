export const grammar = `
start = template

template = template_chunk*
template_chunk = comment / slim_comment / escaped_command / unrelated_escape / command / command_block / content / unmatched

comment = comment_start comment_content* comment_end
comment_start = "{{!--"
comment_content = not_comment_end / [^-]*
not_comment_end = "-" !"-}}"
comment_end = "--}}"

slim_comment = slim_comment_start slim_comment_content* slim_comment_end
slim_comment_start = "{{" "~"? "!"
slim_comment_content = not_slim_comment_end / [^}]*
not_slim_comment_end = "}" !"}"
slim_comment_end = "}}"

command = command_start command_content command_end
command_block = command_block_open template (command_block_sep template)* command_block_close
command_block_open = command_start "#" block_command_call command_end
command_block_sep = command_start ("or" / "else") command_end
command_block_close = command_start "/" command_name command_end
command_start = "{{" "!" "~"?
not_command_start = "{" !"{"
not_command_escape = "\\" !"{{"
command_end = "~"? "}}"
command_contents = [^{]*
block_command_call = command_name command_args?
command_content = command_call / variable_ref
command_call = command_name command_args
command_args = command_arg_and_ws+
command_arg_and_ws = ws command_arg
command_arg = named_command_arg / positional_command_arg
positional_command_arg = command_arg_group / literal / variable_ref
named_command_arg = variable_name "=" (literal / variable_ref)
command_arg_group = "(" command_content ")"
ws = ~'\\\\s+'
command_contentasdf = [a-zA-Z0-9 ]*
command_name = [a-zA-Z][a-zA-Z0-9.]* / "<" / ">" / "==" / "!=" / ">=" / "<="
variable_ref = not_exact_or not_exact_else [@[a-zA-Z][a-zA-Z0-9.[\\\\]\\\\\\"'-]*
not_exact_or = [oO][rR][@[a-zA-Z][a-zA-Z0-9.[\\\\]\\\\\\"'-]* / !"[oO][rR]"
not_exact_else = [eE][lL][sS][eE][@[a-zA-Z][a-zA-Z0-9.[\\\\]\\\\\\"'-]* / !"[eE][lL][sS][eE]"
variable_name = [@[a-zA-Z][a-zA-Z0-9]*
contentw = .*
content = (not_command_start / not_command_escape / [^{\\\\\\\\])+
unrelated_escape = "\\" !command_start
escaped_command = "\\" command_start [^}]* command_end

literal = string_literal / number_literal / boolean_literal / array_literal / object_literal

string_literal = '\\\\"[^\\\\\\\\"]*\\\\"' / '\\\\\\\\'[^\\\\\\\\']*\\\\''

number_literal = [0-9.]+

boolean_literal = "True" / "False"

array_literal = empty_array / single_item_array / multi_item_array
empty_array = array_start ws? array_end
single_item_array = array_start ws? array_item ws? array_end
array_sep = ws? "," ws?
multi_item_array = array_start ws? array_item (array_sep array_item)* ws? array_end
array_start = "["
array_end = "]"
array_item = literal

unmatched = .  // Matches any character that doesn't match other rules
`;


