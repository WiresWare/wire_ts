import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { WireCommand } from '../src/command';

const print = console.log;

class ChainFirstCommand extends WireCommand<string> {
  private readonly value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  async execute() {
    return `${this.value} | First Command`;
  }
}

class ChainSecondCommand extends WireCommand<string> {
  private readonly value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  async execute() {
    return `${this.value} | Second Command`;
  }
}

describe('6. Chain of commands', async () => {
  const SIGNAL_CHAIN_EXECUTION = 'signal_chain_execution';
  const scope1 = {};
  const scope2 = {};

  Wire.many(
    scope1,
    new Map(
      Object.entries({
        [SIGNAL_CHAIN_EXECUTION]: (_) =>
          new ChainFirstCommand(_!).execute().then((output) => new ChainSecondCommand(output).execute()),
      }),
    ),
  );
  Wire.add(scope2, SIGNAL_CHAIN_EXECUTION, (payload: any) => {
    print(`> scope2 -> signal "$SIGNAL_CHAIN_EXECUTION" payload = ${payload} | processing, return nothing`);
  });
  Wire.add(
    scope2,
    SIGNAL_CHAIN_EXECUTION,
    () => {
      print('> scope2 -> signal "$SIGNAL_CHAIN_EXECUTION" single execution');
    },
    1,
  );

  test('6.1 Chain execution of sent signal', async () => {
    expect(Wire.get({ signal: SIGNAL_CHAIN_EXECUTION })).toHaveLength(3);
    const results = await Wire.send(SIGNAL_CHAIN_EXECUTION, 'Test');
    print(
      `>\t Wire: number of signals $SIGNAL_CHAIN_EXECUTION: ${Wire.get({ signal: SIGNAL_CHAIN_EXECUTION }).length}`,
    );
    expect(Wire.get({ signal: SIGNAL_CHAIN_EXECUTION })).toHaveLength(2);
    print('>\t WireSendResults.signalHasNoSubscribers = ${results.signalHasNoSubscribers}');
    expect(results.signalHasNoSubscribers).toBeFalsy();
    print('>\t WireSendResults.dataList.length = ${results.dataList.length}');
    expect(results.list).toHaveLength(1);
  });
});
