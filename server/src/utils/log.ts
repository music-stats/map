import * as colors from 'colors/safe';

function log(message: string): void {
  return console.log(colors.grey(message.trim().replace(/\n\s+/g, '\n')));
}

export default log;
