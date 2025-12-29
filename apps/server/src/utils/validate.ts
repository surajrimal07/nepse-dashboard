// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isValidData(data: any) {
  if (
    !data ||
    typeof data !== 'object' ||
    !data.s ||
    !Array.isArray(data.t) ||
    !Array.isArray(data.c) ||
    !Array.isArray(data.o) ||
    !Array.isArray(data.h) ||
    !Array.isArray(data.l) ||
    !Array.isArray(data.v)
  ) {
    return false;
  }

  return (
    data.s !== 'no_data' &&
    data.t.length > 0 &&
    data.c.length > 0 &&
    data.o.length > 0 &&
    data.h.length > 0 &&
    data.l.length > 0 &&
    data.v.length > 0
  );
}
