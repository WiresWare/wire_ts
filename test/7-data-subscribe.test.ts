import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest';

import Wire from '../src/wire';
import { IWireData } from '../src/interfaces';

const print = console.log;

describe('7. Test multiple subscription yo WireData', async () => {
  const WIRE_DATA_KEY = 'wire_data_key';
  let wd: IWireData<any>;

  const callback_1 = vi.fn(async (v: any): Promise<void> => {
    print('>\t Wire.data -> callback_1:', v);
  });
  const callback_2 = vi.fn(async (v: any): Promise<void> => {
    print('>\t Wire.data -> callback_2:', v);
  });

  beforeEach(async () => {
    print('> beforeEach');
    wd = Wire.data(WIRE_DATA_KEY);
    await wd.unsubscribe();
    wd.subscribe(callback_1);
    wd.subscribe(callback_2);
    callback_1.mockClear();
    callback_2.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TEST_VALUE_1 = 'test 1';
  const TEST_VALUE_2 = 'test 2';

  test('7.1 Check multiple subscriptions', async () => {
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    wd.value = TEST_VALUE_1;
    await vi.runAllTimersAsync();
    expect(callback_1).toHaveBeenCalledWith(TEST_VALUE_1);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_1);
    expect(wd.value).toEqual(TEST_VALUE_1);
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    wd.value = TEST_VALUE_2;
    await vi.runAllTimersAsync();
    expect(callback_1).toHaveBeenCalledWith(TEST_VALUE_2);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_2);
    expect(wd.value).toEqual(TEST_VALUE_2);
    expect(wd.hasListener(callback_2)).toEqual(true);
  });

  test('7.2 Unsubscribe one check other subscriptions', async () => {
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(true);
    print('> [set value] TEST_VALUE_1');
    wd.value = TEST_VALUE_1;
    await vi.runAllTimersAsync();
    print('> [get value for check] TEST_VALUE_1');
    expect(wd.value).toEqual(TEST_VALUE_1);
    await wd.unsubscribe(callback_2);
    expect(wd.hasListener(callback_1)).toEqual(true);
    expect(wd.hasListener(callback_2)).toEqual(false);
    print('> [set] TEST_VALUE_2');
    wd.value = TEST_VALUE_2;
    await vi.runAllTimersAsync();
    expect(wd.value).toEqual(TEST_VALUE_2);
    expect(callback_1).toHaveBeenCalledTimes(2);
    expect(callback_2).toHaveBeenCalledTimes(1);
  });

  test('7.3 Delayed unsubscribe (default) with pending refresh', async () => {
    // Set a value, which queues a refresh
    wd.value = TEST_VALUE_1;

    // Immediately unsubscribe (delayed)
    const unsubscribePromise = wd.unsubscribe(callback_1);

    // The listener should still be there because the refresh is pending
    expect(wd.hasListener(callback_1)).toBe(true);

    // Allow the refresh to complete
    await vi.runAllTimersAsync();

    // Now the listener should be gone
    await unsubscribePromise;
    expect(wd.hasListener(callback_1)).toBe(false);

    // And the callback should have been called once
    expect(callback_1).toHaveBeenCalledTimes(1);
    expect(callback_1).toHaveBeenCalledWith(TEST_VALUE_1);
    expect(callback_2).toHaveBeenCalledTimes(1);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_1);

    // Set a new value
    wd.value = TEST_VALUE_2;
    await vi.runAllTimersAsync();

    // callback_1 should not be called again
    expect(callback_1).toHaveBeenCalledTimes(1);
    // callback_2 should be called again
    expect(callback_2).toHaveBeenCalledTimes(2);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_2);
  });

  test('7.4 Immediate unsubscribe with pending refresh', async () => {
    // Set a value, which queues a refresh
    wd.value = TEST_VALUE_1;

    // Immediately unsubscribe (immediate)
    await wd.unsubscribe(callback_1, true);

    // The listener should be gone immediately
    expect(wd.hasListener(callback_1)).toBe(false);

    // Allow the refresh to complete
    await vi.runAllTimersAsync();

    // The callback should NOT have been called
    expect(callback_1).not.toHaveBeenCalled();
    // callback_2 should have been called
    expect(callback_2).toHaveBeenCalledTimes(1);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_1);

    // Set a new value
    wd.value = TEST_VALUE_2;
    await vi.runAllTimersAsync();

    // callback_1 should not be called
    expect(callback_1).not.toHaveBeenCalled();
    // callback_2 should be called again
    expect(callback_2).toHaveBeenCalledTimes(2);
    expect(callback_2).toHaveBeenCalledWith(TEST_VALUE_2);
  });
});
