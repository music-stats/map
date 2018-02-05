import * as fs from 'fs';

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      'utf8',
      (err, data) => err
        ? reject(err)
        : resolve(data),
    );
  });
}

export function delay(
  promise: (...args: any[]) => Promise<any>,
  wait: number,
  ...args: any[],
): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => promise(...args)
        .then(resolve)
        .catch(reject),
      wait,
    );
  });
}
