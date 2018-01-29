import {getColorString} from '../color';

describe('color utils', () => {
  test('getColorString()', () => {
    expect(getColorString({r: 0, g: 0, b: 0})).toBe('rgba(0, 0, 0, 1)');
    expect(getColorString({r: 10, g: 100, b: 20}, 0.2)).toBe('rgba(10, 100, 20, 0.2)');
    expect(getColorString({r: 250, g: 120, b: 40}, 0.4567567)).toBe('rgba(250, 120, 40, 0.46)');
  });
});
