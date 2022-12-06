import CounterDataKeys from '@/constants/CounterDataKeys';
import { WireWithDatabase } from 'cores.wire';
import type { IWireMiddleware, IWireDatabaseService } from 'cores.wire';

class CounterMiddleware extends WireWithDatabase implements IWireMiddleware {
  constructor(dbService: IWireDatabaseService) {
    console.log('dbService', dbService);
    super(dbService);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onAdd(_: any): void {}

  onData(key: string, prevValue?: any, nextValue?: any): void {
    console.log(`> CounterMiddleware -> onData - key: ${key} = ${nextValue} (${prevValue})`);
    if (key == CounterDataKeys.COUNT) {
      if (nextValue != null) {
        this.databaseService.save(CounterDataKeys.COUNT, nextValue.toString());
      } else {
        this.databaseService.exist(CounterDataKeys.COUNT).then((exist) => {
          exist && this.databaseService.delete(CounterDataKeys.COUNT);
        });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onRemove(_: string, __?: object | null, ___?: any | null): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSend(_: string, __?: any, ___?: object | null): void {}
}

export default CounterMiddleware;
