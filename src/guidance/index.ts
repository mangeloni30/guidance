// import * as types from "types";
import { Program } from "./program";
// import * as sys from 'sys';
// import * as os from 'os';
// import * as requests from 'requests';
import { load } from "./utils";
import { LLM } from "../llms/llm";

export class Guidance {
  private program: Program;
  constructor (
    template: string,
    llm: LLM,
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
