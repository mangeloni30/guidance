import * as types from "types";
import { Program } from "./program";
// import * as sys from 'sys';
// import * as os from 'os';
// import * as requests from 'requests';
import { load } from "./utils";
// import * as llms from './llms';
// import * as library from './library';
// import { load, chain } from './_utils';
// import * as selectors from './selectors';
// import nest_asyncio from 'nest_asyncio';
// import * as asyncio from 'asyncio';

class Guidance {
  private program: Program;
  constructor (
    template: string,
    llm: string,
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

/**
 * @method load
 * @param guidance_file
 * @description 
  Load a guidance program from the given text file.
  If the passed file is a valid local file it will be loaded directly.
  Otherwise, if it starts with "http://" or "https://" it will be loaded
  from the web.
 * @returns 
 */
// const load = (guidance_file: string): any => {
//   let template: string;

//   if (os.existsSync(guidance_file)) {
//     template = fs.readFileSync(guidance_file, "utf-8");
//   } else if (guidance_file.startsWith("http://") || guidance_file.startsWith("https://")) {
//     template = requests.get(guidance_file).text;
//   } else {
//     throw new Error(`Invalid guidance file: ${guidance_file}`);
//   }

//   return (sys.modules as any)[__name__](template);
// }
const myTemplate = "Where there is no guidance, a people falls, but in an abundance of counselors there is safety.";
const guidance = new Guidance(myTemplate, "text-davinci-003", 0, "logprobs", true, true, "stream", "caching", false);
