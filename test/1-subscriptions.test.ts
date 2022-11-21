import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { IWire } from '../src/interfaces';

class PutFindTestObject {}

const print = console.log;

describe('1. Subscriptions', async () => {
  const SIGNAL_G1 = 'SIGNAL_G1';
  const SIGNAL_COUNTER = 'SIGNAL_COUNTER';
  const SIGNAL_NOT_REGISTERED = 'SIGNAL_NOT_REGISTERED';

  const SCOPE = {};

  const listener_dynamic = async (payload: any, wid: number) => {
    print(`> \t WireListener -> data: ${payload} | wid: ${wid} - receives all types of data`);
    return true;
  };

  const wireToAttach = new Wire(SCOPE, 'wire_signal_attached', async (payload, wid) => {
    const wire: IWire = Wire.get({ wireId: wid }).pop()!;
    print(`> \t WireListener on attached wire: "${wire.signal}" with data: ${payload}`);
  });

  print('> 1: Setup -> Cleanup everything');
  await Wire.purge(true);
  print(`> 1: Setup -> Add signal ${SIGNAL_G1} with dynamic WireListener`);
  print('> \t\t Dynamic listener (with specified data type) will react on any signal');
  await Wire.add(SCOPE, SIGNAL_G1, listener_dynamic);
  print(`> 1: Setup -> Attach pre-created signal ${wireToAttach.signal} with string WireListener`);
  Wire.attach(wireToAttach);

  test('1.0. Send registered signal', async () => {
    print('\t Wire.get({ signal: SIGNAL_G1 }):', Wire.get({ signal: SIGNAL_G1 }));
    expect((await Wire.send(SIGNAL_G1, 'payload string')).signalHasNoSubscribers).toBeFalsy();
    expect((await Wire.send(wireToAttach.signal)).signalHasNoSubscribers).toBeFalsy();
  });
  test('1.1. Has signal', async () => {
    print(`> 1.1.1 -> Check if signal (${SIGNAL_G1}) exists in communication layer`);
    expect(Wire.has({ signal: SIGNAL_G1 })).toBeTruthy();
    print('> 1.1.2 -> Wire.has(signal: SIGNAL_NOT_REGISTERED) == isFalse');
    expect(Wire.has({ signal: SIGNAL_NOT_REGISTERED })).toBeFalsy();
    print('> 1.1.3 -> Wire.has(signal: "RANDOM_SIGNAL") == isFalse');
    expect(Wire.has({ signal: 'RANDOM_SIGNAL' })).toBeFalsy();
    print('> 1.1.4 -> Wire.has(wire: wireToAttach) == isTrue');
    expect(Wire.has({ wire: wireToAttach })).toBeTruthy();
  });
  test('1.2. Send unregistered signal', async () => {
    print('> 1.2.1 -> Wire.send(SIGNAL_NOT_REGISTERED) == isTrue');
    expect((await Wire.send(SIGNAL_NOT_REGISTERED)).signalHasNoSubscribers).toBeTruthy();
    print('> 1.2.2 -> Wire.send("RANDOM") == isTrue');
    expect((await Wire.send('RANDOM_SIGNAL')).signalHasNoSubscribers).toBeTruthy();
  });
  test('1.5. Test put/find', async () => {
    print('> TEST put/find instances by their type, the instance should be preserved');
    const putFindTestObject = new PutFindTestObject();
    print(`> 1.5.1 -> Put object of type ${putFindTestObject.constructor.name} to Wire`);
    Wire.put(putFindTestObject);
    print(`> 1.5.2 -> Find object of type ${PutFindTestObject.name.toString()}`);
    expect(Wire.find(PutFindTestObject)).toBe(putFindTestObject);
  });
  test('1.6. Add many and remove by scope', async () => {
    const scope = new PutFindTestObject();
    const SIGNAL_NEW = 'SIGNAL_NEW';
    const signalsToWireListeners = {
      SIGNAL_G1: async () => {
        print('> $TEST_CASE_1_6 -> Hello from $SIGNAL_G1');
        return false;
      },
      SIGNAL_NEW: async () => {
        print('> $TEST_CASE_1_6 -> Hello from $SIGNAL_NEW');
        return SIGNAL_NEW;
      },
      SIGNAL_COUNTER: async () => {
        print('> $TEST_CASE_1_6 -> Hello from $SIGNAL_COUNTER');
        return 1;
      },
    };
    await Wire.addMany(scope, new Map(Object.entries(signalsToWireListeners)));

    print('> 1.6.1 -> Check if added signals exist:', Wire.get({ signal: SIGNAL_G1 }));
    expect(Wire.get({ signal: SIGNAL_G1 })).toHaveLength(2);
    expect(Wire.get({ signal: SIGNAL_NEW })).toHaveLength(1);
    expect(Wire.get({ signal: SIGNAL_COUNTER })).toHaveLength(1);

    print('> 1.6.2 -> Send signal to verify their work');
    expect((await Wire.send(SIGNAL_G1)).dataList).toHaveLength(2);
    expect((await Wire.send(SIGNAL_G1)).dataList[1]).toBe(false);
    expect((await Wire.send(SIGNAL_NEW)).dataList[0]).toBe(SIGNAL_NEW);
    expect((await Wire.send(SIGNAL_COUNTER)).dataList[0]).toBe(1);

    print('> 1.6.3 -> Call Wire.removeAllByScope(scope) -> existed == true');
    expect(await Wire.remove({ scope: scope })).toBeTruthy();
    expect(await Wire.remove({ scope: scope })).toBeFalsy();

    print('> 1.6.4 -> Check no signals after removal - returned list is empty');
    expect(Wire.get({ scope: scope })).toHaveLength(0);
  });
  test('1.7. Remove all by listener', async () => {
    const wire = await Wire.add(new PutFindTestObject(), 'some_random_signal', listener_dynamic);
    expect(Wire.has({ signal: wire.signal })).toBeTruthy();
    expect(Wire.get({ listener: listener_dynamic })).toHaveLength(2);
    expect(await Wire.remove({ listener: listener_dynamic })).toBeTruthy();
    expect(Wire.get({ listener: listener_dynamic })).toHaveLength(0);
  });
});
