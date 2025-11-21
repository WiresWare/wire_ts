import { expect, test, describe } from 'vitest';
import Wire from '../src/wire';

describe('8. Test intermediate values', () => {
  test('8.1 Listeners should receive all intermediate values', async () => {
    const receivedValues: any[] = [];
    const wd = Wire.data('intermediate_values');
    wd.subscribe((value: any) => {
      receivedValues.push(value);
    });

    const valuesToSet = [1, new Set([1, 2, 3]), [4, 5, 6], { a: 1, b: 'hello' }, 5];
    for (const value of valuesToSet) {
      wd.value = value;
    }

    // Wait for all the refresh promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(receivedValues).toEqual(valuesToSet);
  });
});
