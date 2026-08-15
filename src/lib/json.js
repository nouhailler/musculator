// Pulling structured data out of a chat model's answer.
//
// Models vary in how well they honour "JSON only" — some wrap the object in a
// ```json fence, some add a sentence before or after it — so nothing that reads
// a model's output should trust the whole body to parse.

/**
 * The outermost JSON object in `text`, as a string, or `null` when there is
 * none. Fences are stripped first so a fenced object that itself contains prose
 * around the fence is still found.
 */
export function extractJsonObject(text) {
  let t = String(text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  return t.slice(start, end + 1);
}
