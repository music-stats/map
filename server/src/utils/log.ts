import * as colors from 'colors/safe';

function log(message: string): void {
  return console.log(colors.grey(message.trim().replace(/\n\s+/g, '\n')));
}

export function logRequest(url: string): void {
  return console.log(`requesting ${colors.cyan(url)}`);
}

export default log;
