type Key = string | number;
type Transform = ((key: Key) => string) | null;

export function url(strings: TemplateStringsArray, ...keys: Key[]): string {
  return fillTemplate((value: string) => value.replace(/\s/g, '+'), strings, ...keys);
}

// @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates
function fillTemplate(transform: Transform, strings: TemplateStringsArray, ...keys: Key[]): string {
  return keys.reduce(
    (patternParts, key, index) => patternParts.concat(
      transform ? transform(key) : String(key),
      strings[index + 1],
    ),
    [strings[0]],
  ).join('');
}
