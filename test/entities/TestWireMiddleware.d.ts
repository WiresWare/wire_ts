import { IWire, IWireMiddleware } from '../../src/interfaces';
import { WireListener } from '../../src/types';
declare class TestWireMiddleware implements IWireMiddleware {
    private readonly simpleDataStorage;
    private readonly onDataWrote?;
    constructor(simpleDataStorage: any, onDataWrote?: () => void);
    onAdd(wire: IWire): void;
    onData(key: string, prevValue?: any, nextValue?: any): void;
    onRemove(signal: string, scope?: object | null, listener?: WireListener | null): void;
    onSend(signal: string, payload?: any, scope?: object | null): void;
    onDataError(error: Error, key: string, value: any): void;
}
export default TestWireMiddleware;
