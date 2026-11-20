/** Drops empty values and joins arrays as CSV (the API's multi-value format). */
export function toQuery(params: Record<string, unknown>): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v)) {
      if (v.length) out[k] = v.join(",");
    } else out[k] = v as string | number;
  }
  return out;
}
