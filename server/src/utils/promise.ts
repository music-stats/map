import * as fs from 'fs';

export function readFile<DataType>(filePath: string): Promise<DataType> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      'utf8',
      (err, data) => err
        ? reject(err)
        : resolve(JSON.parse(data)),
    );
  });
}

export function writeFile<DataType>(filePath: string, data: DataType): Promise<DataType> {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      (err) => err
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
