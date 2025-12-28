import { expect, test, describe, vi, beforeEach } from 'vitest';
import Wire from '../src/wire';
import { WireDataListenersExecutionMode } from '../src/types';
import { IWireMiddleware } from '../src/interfaces';

describe('10. Robust Error Handling', () => {
  beforeEach(async () => {
    // Purge Wire to ensure a clean state for each test, including middleware.
    await Wire.purge(true);
  });

  test('10.1 All listeners should execute in SEQUENTIAL mode even if one fails', async () => {
    const wd = Wire.data('sequential_error_test');

    const secondListenerPromise = new Promise<boolean>((resolve) => {
      wd.subscribe(() => {
        return Promise.reject(new Error('Test Error'));
      });

      wd.subscribe(() => {
        resolve(true); // Signal that the second listener was executed
      });
    });

    wd.value = 'test';

    const executed = await secondListenerPromise;
    expect(executed).toBe(true);
  });

  test('10.2 Error should be reported to middleware in SEQUENTIAL mode', async () => {
    const error = new Error('Test Error');

    const errorReportedPromise = new Promise<void>(resolve => {
      const testMiddleware: IWireMiddleware = {
        onAdd: vi.fn(),
        onData: vi.fn(),
        onRemove: vi.fn(),
        onSend: vi.fn(),
        onError: (err, key, value) => {
          expect(err).toEqual(error);
          expect(key).toEqual('sequential_error_middleware_test');
          expect(value).toEqual('test');
          resolve(); // Signal that the error was reported
        },
      };
      Wire.middleware(testMiddleware);
    });

    const wd = Wire.data('sequential_error_middleware_test');
    wd.subscribe(() => {
      return Promise.reject(error);
    });

    wd.value = 'test';

    // Await the promise that resolves in the middleware
    await errorReportedPromise;
  });

  test('10.3 Error should be reported to middleware in PARALLEL mode', async () => {
    const error = new Error('Test Error');

    const errorReportedPromise = new Promise<void>(resolve => {
      const testMiddleware: IWireMiddleware = {
        onAdd: vi.fn(),
        onData: vi.fn(),
        onRemove: vi.fn(),
        onSend: vi.fn(),
        onError: (err, key, value) => {
          expect(err).toEqual(error);
          expect(key).toEqual('parallel_error_middleware_test');
          expect(value).toEqual('test');
          resolve(); // Signal that the error was reported
        },
      };
      Wire.middleware(testMiddleware);
    });

    const wd = Wire.data('parallel_error_middleware_test');
    wd.listenersExecutionMode = WireDataListenersExecutionMode.PARALLEL;
    wd.subscribe(() => {
      return Promise.reject(error);
    });

    wd.value = 'test';

    // Await the promise that resolves in the middleware
    await errorReportedPromise;
  });
});
