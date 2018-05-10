import * as fs from 'fs';

// @todo: simplify by using the new "fsPromises" API (added in node v10.0.0)
// @see: https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fspromises_readfile_path_options
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
