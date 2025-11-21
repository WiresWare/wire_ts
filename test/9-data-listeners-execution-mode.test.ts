import { expect, test, describe } from 'vitest';
import Wire from '../src/wire';
import { WireDataListenersExecutionMode } from '../src/types';

describe('9. Test listeners execution mode', () => {
  test('9.1 Sequential execution should be the default', async () => {
    const wd = Wire.data('sequential_execution');
    expect(wd.listenersExecutionMode).toEqual(WireDataListenersExecutionMode.SEQUENTIAL);
  });

  test('9.2 Listeners should execute sequentially', async () => {
    const wd = Wire.data('sequential_execution_test');
    const executionOrder: number[] = [];

    wd.subscribe(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      executionOrder.push(1);
    });

    wd.subscribe(async () => {
      executionOrder.push(2);
    });

    wd.value = 'test';

    // Wait for all the refresh promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(executionOrder).toEqual([1, 2]);
  });

  test('9.3 Listeners should execute in parallel', async () => {
    const wd = Wire.data('parallel_execution_test');
    wd.listenersExecutionMode = WireDataListenersExecutionMode.PARALLEL;
    const executionOrder: number[] = [];

    wd.subscribe(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      executionOrder.push(1);
    });

    wd.subscribe(async () => {
      executionOrder.push(2);
    });

    wd.value = 'test';

    // Wait for all the refresh promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(executionOrder).toEqual([2, 1]);
  });

  test('9.4 All listeners should execute in parallel even if one fails', async () => {
    const wd = Wire.data('parallel_error_test');
    wd.listenersExecutionMode = WireDataListenersExecutionMode.PARALLEL;
    let executed = false;

    wd.subscribe(async () => {
      throw new Error('Test Error');
    });

    wd.subscribe(async () => {
      executed = true;
    });

    wd.value = 'test';

    // Wait for all the refresh promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(executed).toBe(true);
  });
});
