import { Cache, DiskCache } from './caches';

class LLMMeta {
  static _cache: any;
}

class LLM {
  static cache_version = 1;
  static default_system_prompt = 'You are a helpful assistant.';
  llm_name: string = 'unknown';
  chat_mode = false; // by default models are not in role-based chat mode
  model_name = 'unknown';
  private _cache: any;

  constructor() {}

  call(...args: any[], asynchronous = false, kwargs: Record<string, any> = {}) {
    /** Creates a session and calls the LLM with the given arguments.
     *
     * Note that this is a convenience wrapper so you don't have to call session(),
     * for higher performance across multiple calls, use a session directly.
     */
    const session = this.session(asynchronous);
    const out = session(...args, ...kwargs);
    return out;
  }

  getItem(key: string) {
    /** Gets an attribute from the LLM. */
    return this[key];
  }

  session(asynchronous = false) {
    /** Creates a session for the LLM.
     *
     * This implementation is meant to be overridden by subclasses.
     */
    if (asynchronous) {
      return new LLMSession(this);
    } else {
      return new SyncSession(new LLMSession(this));
    }
  }

  encode(string: string, kwargs: Record<string, any> = {}) {
    return this._tokenizer.encode(string, ...kwargs);
  }

  decode(tokens: any[], kwargs: Record<string, any> = {}) {
    return this._tokenizer.decode(tokens, ...kwargs);
  }

  id_to_token(id: any) {
    return this.decode([id]);
  }

  token_to_id(token: string) {
    return this.encode(token)[0];
  }

  get cache() {
    if (this._cache !== undefined) {
      return this._cache;
    } else {
      return this.constructor.cache;
    }
  }

  set cache(value: any) {
    this._cache = value;
  }
}

class LLMSession {
  llm: LLM;
  _call_counts: Record<string, number>;

  constructor(llm: LLM) {
    this.llm = llm;
    this._call_counts = {}; // tracks the number of repeated identical calls to the LLM with non-zero temperature
  }

  enter() {
    return this;
  }

  async call(...args: any[]) {
    return this.llm(...args);
  }

  exit(exc_type: any, exc_value: any, traceback: any) {}

  _gen_key(args_dict: Record<string, any>) {
    delete args_dict.self; // skip the "self" arg
    return Object.values(args_dict)
      .concat([this.llm.model_name, this.llm.constructor.name, this.llm.cache_version])
      .join('_---_');
  }

  _cache_params(args_dict: Record<string, any>): Record<string, any> {
    /**get the parameters for generating the cache key*/
    const key = this._gen_key(args_dict);
    // if we have non-zero temperature we include the call count in the cache key
    if (args_dict.temperature > 0) {
      args_dict.call_count = this._call_counts[key] || 0;

      // increment the call count
      this._call_counts[key] = args_dict.call_count + 1;
    }
    args_dict.model_name = this.llm.model_name;
    args_dict.cache_version = this.llm.cache_version;
    args_dict.class_name = this.ll
