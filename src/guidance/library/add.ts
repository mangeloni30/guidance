export function add(...args: number[]): number {
  return args.reduce((sum, value) => sum + value, 0);
};
