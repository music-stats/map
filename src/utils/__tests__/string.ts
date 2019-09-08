import {convertToTitleCase} from '../string';

describe('string utils', () => {
  describe('convertToTitleCase()', () => {
    it('converts first letters of each word to uppercase and other letters to lowercase', () => {
      expect(convertToTitleCase('japan')).toBe('Japan');
      expect(convertToTitleCase('czech republic')).toBe('Czech Republic');
      expect(convertToTitleCase('CANADA')).toBe('Canada');
      expect(convertToTitleCase('bRAzIl')).toBe('Brazil');
    });
  });
});
