declare module 'micro-conductor' {
  interface Routes {
    [path: string]: (route: string) => void;
  }

  export function parse(strings: TemplateStringsArray, ...keys: any): string;

  export default class Router {
    constructor(routes: Routes, context?: {});
    static normalize(hash: string): string;
    notFound(route: string): void;
    start(): void;
    stop(): void;
    navigate(): void;
  }
}
