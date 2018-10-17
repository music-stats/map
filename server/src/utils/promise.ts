export function delay(promise: (...args: any[]) => Promise<any>, wait: number, ...args: any[]): Promise<any> {
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

  // @see https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works
  return promises.reduce(enqueuePromise, Promise.resolve())
    .then(() => results);
}
