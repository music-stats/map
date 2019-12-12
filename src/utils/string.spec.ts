import {url} from './string';

describe('string utils', () => {
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
