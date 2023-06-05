class Program {
  /**
   * A program template that can be compiled and executed to generate a new filled in (executed) program.
   *
   * Note that as the template gets executed {{!-- handlebars comment markers --}} get left in
   * the generated output to mark where template tags used to be.
   */

  private _text: string;
  private llm: guidance.llms.LLM | null;
  private cache_seed: number | null;
  private caching: boolean | null;
  private logprobs: number | null;
  private async_mode: boolean;
  private silent: boolean | null;
  private stream: boolean | null;
  private await_missing: boolean;
  private _variables: { [key: string]: any };
  private _id: string;
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

  constructor (
      text: string,
      llm: guidance.llms.LLM | null = null,
      cache_seed: number | null = 0,
      logprobs: number | null = null,
      silent: boolean | null = null,
      async_mode: boolean = false,
      stream: boolean | null = null,
      caching: boolean | null = null,
      await_missing: boolean = false,
      ...kwargs: any[]
  ) {
      // see if we were given a raw function instead of a string template
      // if so, convert it to a string template that calls the function
      if (typeof text !== "string" && typeof text === "function") {
          const sig = inspect.signature(text);
          let args = "";
          for (const [name, _] of sig.parameters.items()) {
              args += ` ${name}=${name}`;
          }
          const fname = _utils.find_func_name(text, kwargs);
          kwargs[fname] = text;
          text = `{{set (${fname}${args})}}`;
      }

      // save the given parameters
      this._text = text;
      this.llm = llm || (guidance as any).llm;
      this.cache_seed = cache_seed;
      this.caching = caching;
      this.logprobs = logprobs;
      this.async_mode = async_mode;
      this.silent = silent;
      this.stream = stream;
      this.await_missing = await_missing;
      if (this.silent === null) {
          this.silent = this.stream === true || !_utils.is_interactive();
      }

      // set our variables
      this._variables = {};
      this._variables = { ...this._variables, ..._built_ins };
      this._variables = {
          ...this._variables,
          llm,
          ...kwargs,
      };

      // set internal state variables
      this._id = (Math.random() * 100000).toString();
     
}