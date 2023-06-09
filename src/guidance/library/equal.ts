export function equal(...args: any[]): boolean {
  const firstArg = args[0];
  for (let i = 1; i < args.length; i++) {
    if (args[i] !== firstArg) {
      return false;
    }
  }
  return true;
};
