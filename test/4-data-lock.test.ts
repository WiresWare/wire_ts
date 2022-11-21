import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { WireData, WireDataLockToken } from '../src/index';

const print = console.log;

describe('4. Data lock/unlock', async () => {
  const DATA_KEY = 'DATA_KEY';

  const data_lockToken_one = new WireDataLockToken();
  const data_lockToken_two = new WireDataLockToken();

  Wire.data(DATA_KEY).subscribe(async (value) => {
    print(`> $DATA_KEY -> updated: ${value}`);
  });
  print('>\t set initial value and lock');
  Wire.data(DATA_KEY, 'initial value');
  Wire.data(DATA_KEY).lock(data_lockToken_one);

  test('4.1 Lock data with token', async () => {
    expect(Wire.data(DATA_KEY).isLocked).toBeTruthy();
    expect(Wire.data(DATA_KEY).unlock(data_lockToken_one)).toBeTruthy();
    expect(Wire.data(DATA_KEY).isLocked).toBeFalsy();
    expect(Wire.data(DATA_KEY, 'can be changed')).toBeInstanceOf(WireData);
    print('>\t Wire.data(DATA_KEY).lock(data_lockToken_one)');
    expect(Wire.data(DATA_KEY).lock(data_lockToken_one)).toBeTruthy();
    print('>\t Wire.data(DATA_KEY, value: cant be changed)');
    expect(() => Wire.data(DATA_KEY, 'cant be changed')).toThrowError();
    expect(Wire.data(DATA_KEY).lock(data_lockToken_one)).toBeTruthy();
    expect(Wire.data(DATA_KEY).lock(data_lockToken_one)).toBeTruthy();
    expect(Wire.data(DATA_KEY).lock(data_lockToken_two)).toBeFalsy();
  });
});
