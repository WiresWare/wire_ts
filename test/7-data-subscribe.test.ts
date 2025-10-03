import { expect, test, describe, beforeEach } from 'vitest';

import Wire from '../src/wire';

const print = console.log;

describe('7. Test multiple subscription yo WireData', async () => {
  const WIRE_DATA_KEY = 'wire_data_key';

  const callback_1 = async(v: any): Promise<void> => {
    print('>\t Wire.data -> callback_1:', v);
  };
  const callback_2 = async(v: any): Promise<void> => {
    print('>\t Wire.data -> callback_2:', v);
  };

  const wd = Wire.data(WIRE_DATA_KEY);

  beforeEach(async() => {
    print('> beforeEach');
    await wd.unsubscribe();
    wd.subscribe(callback_1);
    wd.subscribe(callback_2);
  });

  const TEST_VALUE_1 = 'test 1';
  const TEST_VALUE_2 = 'test 2';

  test('7.1 Check multiple subscriptions', async () => {
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    wd.value = TEST_VALUE_1;
    expect(wd.value).toEqual(TEST_VALUE_1);
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    wd.value = TEST_VALUE_2;
    expect(wd.value).toEqual(TEST_VALUE_2);
    expect(wd.hasListener(callback_2)).toEqual(true);
  });

  test('7.2 Unsubscribe one check other subscriptions', async () => {
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    print('> [set value] TEST_VALUE_1');
    wd.value = TEST_VALUE_1;
    print('> [get value for check] TEST_VALUE_1');
    expect(wd.value).toEqual(TEST_VALUE_1);
    await wd.unsubscribe(callback_2);
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(false);
    print('> [set] TEST_VALUE_2');
    wd.value = TEST_VALUE_2;
    expect(wd.value).toEqual(TEST_VALUE_2);
    wd.unsubscribe(callback_1);
    // The listener will be present because value set is async
    // and remove of the listener happens when last refresh is complete
    expect(wd.hasListener(callback_1)).toEqual(true);
  });
});
