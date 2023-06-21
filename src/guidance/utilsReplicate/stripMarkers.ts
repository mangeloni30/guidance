export function stripMarkers(s: string): string | null {
  if (s === null) {
    return null;
  }
  return s.replace(/{{!--G.*?--}}/g, "");
};
