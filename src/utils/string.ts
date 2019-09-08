export function convertToTitleCase(value: string): string {
  return value
    .split(' ')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
}
