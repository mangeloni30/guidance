// import * as types from "types";
import { Program } from "./program";
// import * as sys from 'sys';
// import * as os from 'os';
// import * as requests from 'requests';
import { load } from "./utils";

interface LLMInterface {
  getCacheVersion(): number;
  setCacheVersion(value: number): void;
  getDefault_system_prompt(): string;
  setDefault_system_prompt(value: string): void;
  getLlmName(): string;
  setLlmName(value: string): void;
  getChatMode(): boolean;
  setChatMode(value: boolean): void;
  getModelName(): string;
  setModelName(value: string): void;
  getTokenizer(): string;
  __getitem__(key: string): any;
  session(asynchronous?: boolean): any;
  encode(value: string): void;
  decode(tokens: any, kwargs?: any): void;
  idToToken(id: number): any;
  tokenToId(token: string): any;
}

export class Guidance {
  private program: Program;
  constructor (
    template: string,
    llm: LLMInterface,
    cache_seed: number,
    logprobs: any,
    silent: any,
    async_mode: boolean,
    stream: any,
    caching: any,
    await_missing: boolean
  ) {
    this.program = new Program(template, llm, cache_seed, logprobs, silent, async_mode, stream, caching, await_missing);
  }

   // Setter function for the program key
   setProgram(program: Program) {
    this.program = program;
  }

  // Getter function for the program key
  getProgram(): Program {
    return this.program;
  }
}

// module.exports.Guidance = Guidance;

// const myTemplate = "Where there is no guidance, a people falls, but in an abundance of counselors there is safety.";
// const guidance = new Guidance(myTemplate, "text-davinci-003", 0, "logprobs", true, true, "stream", "caching", false);
