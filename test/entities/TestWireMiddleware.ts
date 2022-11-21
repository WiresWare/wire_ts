import { IWire, IWireMiddleware } from '../../src/interfaces';
import { WireListener } from '../../src/types';

class TestWireMiddleware implements IWireMiddleware {
  private readonly simpleDataStorage: any;
  private readonly onDataWrote?: () => void;
  constructor(simpleDataStorage: any, onDataWrote?: () => void) {
    this.simpleDataStorage = simpleDataStorage;
    this.onDataWrote = onDataWrote;
  }
  onAdd(wire: IWire): void {
    console.log(`> TestWireMiddleware -> onAdd: Wire.signal = ${wire.signal}`);
  }

  onData(key: string, prevValue?: any, nextValue?: any): void {
    console.log(`> TestWireMiddleware -> onData:`, { key, prevValue, nextValue });
    if (nextValue != null) this.simpleDataStorage[key] = nextValue;
    else delete this.simpleDataStorage[key];
    this.onDataWrote?.call(this);
  }

  onRemove(signal: string, scope?: object | null, listener?: WireListener | null): void {
    console.log(`> TestWireMiddleware -> onData: key = ${signal} | ${scope} | ${listener}`);
  }

  onSend(signal: string, payload?: any, scope?: object | null): void {
    console.log(`> TestWireMiddleware -> onRemove: signal = ${signal} | ${payload} | ${scope}`);
  }
}

export default TestWireMiddleware;
