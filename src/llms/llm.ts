// import { Cache, DiskCache } from './caches';

class LLMMeta {
  static _cache: any;
}

export class LLM {
  // private cache: any;
  private cacheVersion: number;
  private defaultSystemPrompt: string;
  private llmName: string;
  private chatMode: boolean;
  private modelName: string;
  private tokenizer: string;

  constructor() {
    this.chatMode = false; // by default models are not in role-based chat mode
    this.modelName = "unknown";
    this.llmName = "unknown";
    this.defaultSystemPrompt = "You are a helpful assistant.";
    this.cacheVersion = 1;
  }

   // cache_version property
  public getCacheVersion(): number {
    return this.cacheVersion;
  }

  public setCacheVersion(value: number) {
    this.cacheVersion = value;
  }

  // default_system_prompt property
  public getDefaultSystemPrompt(): string {
    return this.defaultSystemPrompt;
  }

  public setDefaultSystemPrompt(value: string) {
    this.defaultSystemPrompt = value;
  }

  // llm_name property
  public getLlmName(): string {
    return this.llmName;
  }

  public setLlmName(value: string) {
    this.llmName = value;
  }

  // chat_mode property
  public getChatMode(): boolean {
    return this.chatMode;
  }

  public setChatMode(value: boolean) {
    this.chatMode = value;
  }

  // model_name property
  public getModelName(): string {
    return this.modelName;
  }

  public setModelName(value: string) {
    this.modelName = value;
  }

  public getTokenizer(): string {
    return this.tokenizer;
  }

  __getitem__(key: string) {
      return this[key];
  }

  /**
   * 
   * @param asynchronous 
   * Creates a session for the LLM.
   * This implementation is meant to be overridden by subclasses.
   * @returns 
   */
  session(asynchronous: boolean = false) {
    if (asynchronous) {
        return new LLMSession(this);
    } else {
        return new SyncSession(new LLMSession(this));
    }
  }

  encode(value: string) {
    this.tokenizer = encodeURIComponent(value); 
  }

  decode(tokens: any, kwargs: any = {}) {
    this.tokenizer = decodeURIComponent(tokens);
  }

  public idToToken(id: number) {
    return this.decode([id]);
  }

  public tokenToId(token: string) {
    return this.encode(token)[0];
  }
};

interface LLModel {
  model_name: string;
  cache_version: number;
  __class__: {
      __name__: string;
  };
}

class LLMSession {
  private llm: LLModel;
  private call_counts: { [key: string]: number };

  constructor(llm: LLModel) {
    this.llm = llm;
    this.call_counts = {}; // tracks the number of repeated identical calls to the LLM with non-zero temperature
  }

  public __enter__() {
      return this;
  }

  public __exit__(exc_type: any, exc_value: any, traceback: any) {
      // Do nothing
  }

  private _gen_key(args_dict: { [key: string]: any }) {
    delete args_dict["self"]; // skip the "self" arg
    return Object.values(args_dict)
        .concat([this.llm.model_name, this.llm.__class__.__name__, this.llm.cache_version])
        .join("_---_");
  }

  private _cache_params(args_dict: { [key: string]: any }): { [key: string]: any } {
    const key = this._gen_key(args_dict);
    // if we have non-zero temperature we include the call count in the cache key
    if (args_dict.temperature > 0) {
      args_dict.call_count = this.call_counts[key] || 0;

      // increment the call count
      this.call_counts[key] = args_dict.call_count + 1;
    }
    args_dict.model_name = this.llm.model_name;
    args_dict.cache_version = this.llm.cache_version;
    args_dict.class_name = this.llm.__class__.__name__;

    return args_dict;
  }
}

class SyncSession {
  private _session: any;

  constructor(session: any) {
    this._session = session;
  }

  public __enter__() {
    this._session.__enter__();
    return this;
  }

  public __exit__(exc_type: any, exc_value: any, traceback: any) {
    return this._session.__exit__(exc_type, exc_value, traceback);
  }

  public __call__(...args: any[]) {
    return (async () => {
      const eventLoop = require('events').default;
      return await eventLoop.runUntilComplete(this._session.__call__(...args));
    })();
  }
}

module.exports.LLM = LLM;