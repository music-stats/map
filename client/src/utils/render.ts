export function trimExtraSpaces(template: string): string {
  return template
    .replace(/\n\s+/g, ' ')
    .replace(/>\s+([^<])/g, (_, p1) => `>${p1}`)
    .replace(/([^>])\s+</g, (_, p1) => `${p1}<`)
    .replace(/="\s+/g, '="')
    .replace(/\s+"/g, '"');
}
