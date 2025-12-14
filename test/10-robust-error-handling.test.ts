import { expect, test, describe, vi } from 'vitest';
import Wire from '../src/wire';
import { WireDataListenersExecutionMode } from '../src/types';
import { IWireMiddleware } from '../src/interfaces';

describe('10. Robust Error Handling', () => {
  test('10.1 All listeners should execute in SEQUENTIAL mode even if one fails', () =>
    new Promise<void>((done) => {
      const wd = Wire.data('sequential_error_test');
      let executed = false;

      wd.subscribe(() => {
        throw new Error('Test Error');
      });

      wd.subscribe(() => {
        executed = true;
        expect(executed).toBe(true);
        done();
      });

      wd.value = 'test';
    }));

  test('10.2 Error should be reported to middleware in SEQUENTIAL mode', () =>
    new Promise<void>((done) => {
      const error = new Error('Test Error');
      const testMiddleware: IWireMiddleware = {
        onAdd: vi.fn(),
        onData: vi.fn(),
        onRemove: vi.fn(),
        onSend: vi.fn(),
        onListenerError: (err, key, value) => {
          expect(err).toEqual(error);
          expect(key).toEqual('sequential_error_middleware_test');
          expect(value).toEqual('test');
          done();
        },
      };

      Wire.middleware(testMiddleware);

      const wd = Wire.data('sequential_error_middleware_test');

      wd.subscribe(() => {
        throw error;
      });

      wd.value = 'test';
    }));

  test('10.3 Error should be reported to middleware in PARALLEL mode', () =>
    new Promise<void>((done) => {
      const error = new Error('Test Error');
      const testMiddleware: IWireMiddleware = {
        onAdd: vi.fn(),
        onData: vi.fn(),
        onRemove: vi.fn(),
        onSend: vi.fn(),
        onListenerError: (err, key, value) => {
          expect(err).toEqual(error);
          expect(key).toEqual('parallel_error_middleware_test');
          expect(value).toEqual('test');
          done();
        },
      };

      Wire.middleware(testMiddleware);

      const wd = Wire.data('parallel_error_middleware_test');
      wd.listenersExecutionMode = WireDataListenersExecutionMode.PARALLEL;

      wd.subscribe(() => {
        throw error;
      });

      wd.value = 'test';
    }));
});
