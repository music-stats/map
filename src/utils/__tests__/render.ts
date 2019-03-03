import {html, url} from '../render';

describe('render utils', () => {
  describe('html`` tagged template', () => {
    test('fills a template with all keys, trimming extra spaces and line breaks', () => {
      expect(
        html`
          <article>
            <header>
              ${'Test header'}
            </header>
            <main
              class="InfoBox"
              style="
                color: rgb(${100}, ${200}, ${255});
              "
            >
              <p>${5} >= ${4}</p>

              <span>it is</span>

              <img src="${'bird'}.png" />
            </main>
          </article>
        `
      ).toBe(
        // tslint:disable-next-line:max-line-length
        '<article><header>Test header</header><main class=\"InfoBox\" style=\"color: rgb(100, 200, 255);\"><p>5 >= 4</p><span>it is</span><img src=\"bird.png\"/></main></article>'
      );
    });
  });

  describe('url`` tagged template', () => {
    test('replaces spaces with "+" characters', () => {
      expect(
        url`https://example.org/${'some path'}?param=${'some value'}`
      ).toBe(
        'https://example.org/some+path?param=some+value'
      );
    });
  });
});
