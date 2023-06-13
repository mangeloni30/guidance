import { Guidance } from "./src/guidance";
import { LLM } from "./src/llms/llm";

const myGuidanceInstance = new Guidance(
  "dumbTemplate",
  new LLM(),
  0,
  "logprobs",
  true,
  true,
  "stream",
  "caching",
  false
);

console.log("Testing...");