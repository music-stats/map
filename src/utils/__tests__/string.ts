import {convertToTitleCase, url} from '../string';

describe('string utils', () => {
  describe('convertToTitleCase()', () => {
    it('converts first letters of each word to uppercase and other letters to lowercase', () => {
      expect(convertToTitleCase('japan')).toBe('Japan');
      expect(convertToTitleCase('czech republic')).toBe('Czech Republic');
      expect(convertToTitleCase('CANADA')).toBe('Canada');
      expect(convertToTitleCase('bRAzIl')).toBe('Brazil');
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
