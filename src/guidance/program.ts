import {
  add,
  assistant,
  await_,
  block,
  break_,
  contains,
  each,
  equal,
  gen,
  geneach,
  greater,
  if_,
  less,
  parse,
  role,
  select,
  set,
  strip,
  subtract,
  system,
  unless,
  user
} from "./library";
import { LLM } from "../llms/llm";

export class Program {
  /**
   * A program template that can be compiled and executed to generate a new filled in (executed) program.
   *
   * Note that as the template gets executed {{!-- handlebars comment markers --}} get left in
   * the generated output to mark where template tags used to be.
   */

  /**
    text : str
    The program string to use as a guidance template.
   */
  private text: string;
  /**
    llm: guidance.llms.LLM (defaults to guidance.llm)
    The language model to use for executing the program
   */
  private llm: LLM;
  /** 
    cache_seed: int (default 0) or None
    The seed to use for the cache. If you want to use the same cache for multiple programs
    you can set this to the same value for all of them. Set this to None to disable caching.
    Caching is enabled by default, and saves calls that have tempurature=0, and also saves
    higher temperature calls but uses different seed for each call.
  */
  private cache_seed: number | null;
  /**
    caching : bool (default None)
    If True, the program will cache the results of the LLM. If False, it will not cache the results.
    If None, it will use the default caching setting from the LLM.
  */
  private caching: boolean | null;
  /**
    logprobs : int or None (default)
    The number of logprobs to return from the language model for each token. (not well supported yet,
    since some endpoints don't support it)
  */
  private logprobs: number | null;
  private async_mode: boolean;
  /**
    silent : bool (default None)
    If True, the program will not display any output. This is useful for programs that are
    only used to generate variables for other programs. If None we automatically set this based
    on if we are streaming and if we are in interactive mode.
   */
  private silent: boolean | null;
  /**
    stream : bool (default None)
    If True, the program will try to stream all the results from the LLM token by token. If None
    streaming will be enabled if is needed for funtionality. (Warning: this param may change a bit in the future)
   */
  private stream: boolean | null;
  /**
    await_missing : bool (default False)
    If True, the program will automatically await any missing variables. This means the program
    will stop executation at that point and return a paritally executed program. This is useful
    for executing programs on different machines, for example shipping a program to a GPU machine
    then waiting for the results to come back for any local processing, then shipping it back to
    the GPU machine to continue execution.
  */
  private await_missing: boolean;
  private _variables: { [key: string]: any };
  private id: string;
  private _comm: any; // front end communication object
  private _executor: any; // the ProgramExecutor object that is running the program
  private _last_display_update: number; // the last time we updated the display (used for throttling updates)
  private _execute_complete: any; // fires when the program is done executing to resolve __await__
  private _emit_stream_event: any; // fires when we need to emit a stream event
  private _displaying: boolean; // if we are displaying we need to update the display as we execute
  private _displayed: boolean; // marks if we have been displayed in the client yet
  private _displaying_html: boolean; // if we are displaying html (vs. text)
  private display_throttle_limit: number;
  private update_display: any;
  private _ipython: any;
  private built_ins = {
    gen,
    each: each,
    geneach,
    select,
    if: if_,
    unless,
    add,
    subtract,
    strip,
    block,
    set,
    await: await_,
    role,
    user,
    system,
    assistant,
    break: break_,
    equal,
    "==": equal,
    greater,
    ">": greater,
    less,
    "<": less,
    contains,
    parse
  }

  constructor (
      text: string,
      llm: LLM,
      cache_seed: number | null = 0,
      logprobs: number | null = null,
      silent: boolean | null = null,
      async_mode: boolean = false,
      stream: boolean | null = null,
      caching: boolean | null = null,
      await_missing: boolean = false,
      // ...kwargs: any[]
  ) {
      // see if we were given a raw function instead of a string template
      // if so, convert it to a string template that calls the function
      // if (typeof text !== "string" && typeof text === "function") { TODO: check this
      //     const sig = inspect.signature(text);
      //     let args = "";
      //     for (const [name, _] of sig.parameters.items()) {
      //         args += ` ${name}=${name}`;
      //     }
      //     const fname = _utils.find_func_name(text, kwargs);
      //     kwargs[fname] = text;
      //     text = `{{set (${fname}${args})}}`;
      // }

      // save the given parameters
      this.text = text;
      this.llm = llm; // || (guidance as any).llm;
      this.cache_seed = cache_seed;
      this.caching = caching;
      this.logprobs = logprobs;
      this.async_mode = async_mode;
      this.silent = silent;
      this.stream = stream;
      this.await_missing = await_missing;
      this.id = (Math.random() * 100000).toString();
      // if (this.silent === null) {
      //     this.silent = this.stream === true || !_utils.is_interactive();
      // }

      // set our variables
      // this._variables = {};
      // this._variables = { ...this._variables, ..._built_ins };
      // this._variables = {
      //     ...this._variables,
      //     llm,
      //     ...kwargs,
      // };
    }
}