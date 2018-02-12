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

export function sequence(promises: Array<Promise<any>>): Promise<any> {
  const results: any[] = [];

  function enqueuePromise(queue: Promise<any>, promise: Promise<any>) {
    return queue
      .then(() => (promise as any)().then((result: any) => results.push(result)));
  }

  return promises.reduce(enqueuePromise, Promise.resolve())
    .then(() => results);
}
