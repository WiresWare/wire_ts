import { expect, test, describe } from 'vitest';
import Wire from '../src/wire';

describe('1. Subscriptions', async () => {
  const SIGNAL_G1 = 'SIGNAL';
  // const SIGNAL_COUNTER = 'SIGNAL_COUNTER';
  const SIGNAL_NOT_REGISTERED = 'SIGNAL_NOT_REGISTERED';

  // const TEST_CASE_1_1 = '1.1. Has Signal';
  // const TEST_CASE_1_2 = '1.2. Unregistered Signal';
  // const TEST_CASE_1_3 = '1.3. Detach Signal';
  // const TEST_CASE_1_4 = '1.4. Counter Signal with 2 replies';
  // const TEST_CASE_1_5 = '1.5. Test put/find';
  // const TEST_CASE_1_6 = '1.6. Add many and remove by scope';

  const SCOPE = Object();
  const print = console.log;

  const listener_dynamic = async (payload, wid) => {
    console.log(`> \t WireListener -> data: ${payload} | wid: ${wid} - receives all types of data`);
    return true;
  };

  const wireToAttach = new Wire(SCOPE, 'wire_signal_attached', async (payload, wid) => {
    const wire = Wire.get(null, null, null, wid).pop();
    console.log(`> \t WireListener on attached wire: "${wire.signal}" with data: ${payload}`);
  });

  console.log('> 1: Setup -> Cleanup everything');
  await Wire.purge(true);
  console.log('> 1: Setup -> Add signal $SIGNAL_G1 with dynamic WireListener');
  console.log('> \t\t Dynamic listener (with specified data type) will react on any signal');
  await Wire.add(SCOPE, SIGNAL_G1, listener_dynamic);
  console.log('> 1: Setup -> Attach pre-created signal ${wireToAttach.signal} with string WireListener');
  Wire.attach(wireToAttach);

  test('1.0. Send registered signal', async () => {
    expect((await Wire.send(SIGNAL_G1, 'payload string')).signalHasNoSubscribers).toBeFalsy();
    expect((await Wire.send(wireToAttach.signal)).signalHasNoSubscribers).toBeFalsy();
  });
  test('1.1. Has signal', async () => {
    print(`> 1.1.1 -> Check if signal (${SIGNAL_G1}) exists in communication layer`);
    expect(Wire.has(SIGNAL_G1)).toBeTruthy();
    print('> 1.1.2 -> Wire.has(signal: SIGNAL_NOT_REGISTERED) == isFalse');
    expect(Wire.has(SIGNAL_NOT_REGISTERED)).toBeFalsy();
    print('> 1.1.3 -> Wire.has(signal: "RANDOM_SIGNAL") == isFalse');
    expect(Wire.has('RANDOM_SIGNAL')).toBeFalsy();
    print('> 1.1.4 -> Wire.has(wire: wireToAttach) == isTrue');
    expect(Wire.has(null, wireToAttach)).toBeTruthy();
  });
  test('1.2. Send unregistered signal', async () => {
    print('> 1.2.1 -> Wire.send(SIGNAL_NOT_REGISTERED) == isTrue');
    expect((await Wire.send(SIGNAL_NOT_REGISTERED)).signalHasNoSubscribers).toBeTruthy();
    print('> 1.2.2 -> Wire.send("RANDOM") == isTrue');
    expect((await Wire.send('RANDOM')).signalHasNoSubscribers).toBeTruthy();
  });
});
