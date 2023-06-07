import { readFileSync, existsSync } from "fs";
import axios from "axios";

export function load(guidance_file: string): any {
  if (existsSync(guidance_file)) {
    return readFileSync(guidance_file, 'utf-8');
  } else if (guidance_file.startsWith('http://') || guidance_file.startsWith('https://')) {
    return axios.get(guidance_file).then(response => response.data);
  } else {
    throw new Error(`Invalid guidance file: ${guidance_file}`);
  }
};
