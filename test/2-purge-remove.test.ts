import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { IWire } from '../src/interfaces';
// @ts-ignore
import TestWireMiddleware from './entities/TestWireMiddleware';

const print = console.log;

describe('2. Purge and remove', async () => {
  const SIGNAL_G2 = 'G2_SIGNAL_SUBSCRIPTION';
  const SIGNAL_G2_2 = 'G2_SIGNAL_SUBSCRIPTION_2';
  const SCOPE = {};

  const listener = async (data: any, wid: number): Promise<void> => {
    const wire = Wire.get({ wireId: wid }).shift() as IWire;
    print(`2. -> Response on ${wire.signal} with data: ${data}`);
  };

  const testWire = new Wire(SCOPE, 'wire_signal_2', listener);
  const testMiddleware = new TestWireMiddleware({});

  await Wire.add(SCOPE, SIGNAL_G2, listener);
  await Wire.add(SCOPE, SIGNAL_G2_2, listener);

  Wire.attach(testWire);
  Wire.middleware(testMiddleware);

  test('2.1 Purge', async () => {
    print('> 2.1.1 -> Wire.has(wire: ${testWire}) == isTrue');
    expect(Wire.has({ wire: testWire })).toBeTruthy();
    print('> 2.1.2 -> Wire.has(signal: $SIGNAL_G2) == isTrue');
    expect(Wire.has({ signal: SIGNAL_G2 })).toBeTruthy();
    print('> 2.1.3 -> You can not attach wire twice - throw Error');
    expect(() => Wire.attach(testWire)).toThrowError();

    print('> ======================= PURGE =======================');
    await Wire.purge(true);

    print('> 2.1.4 -> Wire.send(SIGNAL) == isTrue');
    expect((await Wire.send(SIGNAL_G2)).signalHasNoSubscribers).toBeTruthy();
    print('> 2.1.5 -> Wire.has(wire: testWire) == isFalse');
    expect(Wire.has({ wire: testWire })).toBeFalsy();
    print('> 2.1.6 -> Wire.has(signal: SIGNAL) == isFalse');
    expect(Wire.has({ signal: SIGNAL_G2 })).toBeFalsy();

    print('> 2.1.7 -> Wire.get(signal: SIGNAL_G2) == isEmpty');
    expect(Wire.get({ signal: SIGNAL_G2 })).toHaveLength(0);
    print('> 2.1.8 -> Wire.get(signal: SIGNAL_G2_2) == isEmpty');
    expect(Wire.get({ signal: SIGNAL_G2_2 })).toHaveLength(0);
    print('> 2.1.9 -> Wire.get(signal: testWire.signal) == isEmpty');
    expect(Wire.get({ signal: testWire.signal })).toHaveLength(0);
    print('> 2.1.10 -> Wire.get(scope: SCOPE) == isEmpty');
    expect(Wire.get({ scope: SCOPE })).toHaveLength(0);
    print('> 2.1.11 -> Wire.get(listener: listener) == isEmpty');
    expect(Wire.get({ listener: listener })).toHaveLength(0);
  });
});
