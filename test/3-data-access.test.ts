import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { WireData } from '../src/index';

// @ts-ignore
import TestWireMiddleware from './entities/TestWireMiddleware';

const print = console.log;

describe('3. Data access', async () => {
  const KEY_STRING = 'key';
  const DATA_STRING = 'value';
  const simpleDataStorage = {};
  const testMiddleware = new TestWireMiddleware(simpleDataStorage);

  print(`>\t -> add middleware with empty map - <String, dynamic>{}`);
  await Wire.middleware(testMiddleware);

  test('3.1 Check data present in data container layer after being set', async () => {
    print('>\t -> Set value and check WireData return type');
    expect(Wire.data(KEY_STRING).isSet).toBeFalsy();
    expect(Wire.data(KEY_STRING, DATA_STRING)).toBeInstanceOf(WireData);
    expect(Wire.data(KEY_STRING)).toBeInstanceOf(WireData);
    expect(Wire.data(KEY_STRING).isSet).toBeTruthy();
    expect(Wire.data(KEY_STRING).isLocked).toBeFalsy();
    expect(Wire.data(KEY_STRING).value).toBe(DATA_STRING);
    print('>\t -> Set value and check WireData return type');
    // eslint-disable-next-line no-prototype-builtins
    expect(simpleDataStorage.hasOwnProperty(KEY_STRING)).toBeTruthy();
    // @ts-ignore
    expect(simpleDataStorage[KEY_STRING]).toBe(DATA_STRING);

    print('>\t -> Remove WireData $KEY_STRING');
    await Wire.data(KEY_STRING).remove();
    expect(Wire.data(KEY_STRING).isSet).toBeFalsy();
    expect(Wire.data(KEY_STRING).value).toBeUndefined();
    // eslint-disable-next-line no-prototype-builtins
    expect(simpleDataStorage.hasOwnProperty(KEY_STRING)).toBeFalsy();
  });
});
