export function delay<T>(promise: (...args: any[]) => Promise<T>, wait: number, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => promise(...args)
        .then(resolve)
        .catch(reject),
      wait,
    );
  });
}

type EnquableFunc<T> = () => Promise<T>;

export function sequence<T>(funcs: Array<EnquableFunc<T>>): Promise<T[]> {
  const results: T[] = [];
  const pushResult: ((result: T) => void) = (result: T) => results.push(result);
  const enqueueFuncs = (queue: Promise<void>, func: EnquableFunc<T>) => queue.then(() => func().then(pushResult));

  // @see: https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works
  return funcs.reduce(enqueueFuncs, Promise.resolve())
    .then(() => results);
}
