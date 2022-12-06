import { IWire, IWireData, IWireMiddleware, IWireSendResults } from './interfaces';
import { WireDataOnReset, WireListener } from './types';
export declare class WireCommunicateLayer {
    private _wireById;
    private _wireIdsBySignal;
    add(wire: IWire): IWire;
    hasSignal(signal: string): boolean;
    hasWire(wire: IWire): boolean;
    send(signal: string, payload?: any | null, scope?: object | null): Promise<IWireSendResults>;
    private _processSendError;
    remove(signal: string, scope?: object, listener?: WireListener | null): Promise<boolean>;
    clear(): Promise<void>;
    getBySignal(signal: string): (IWire | undefined)[];
    getByScope(scope: object): Array<IWire> | undefined;
    getByListener(listener: WireListener): Array<IWire> | undefined;
    getByWID(wireId: number): IWire | undefined;
    _removeWire(wire: IWire): Promise<boolean>;
}
export declare class WireMiddlewaresLayer {
    private readonly _MIDDLEWARE_LIST;
    has(middleware: IWireMiddleware): boolean;
    add(middleware: IWireMiddleware): void;
    clear(): void;
    onData(key: string, prevValue: any, nextValue: any): void;
    onReset(key: string, prevValue: any): void;
    onRemove(signal: string, scope?: object, listener?: WireListener | null): void;
    onSend(signal: string, payload: any): void;
    onAdd(wire: IWire): void;
    _process(p: (mw: IWireMiddleware) => void): void;
}
export declare class WireDataContainerLayer {
    private _dataMap;
    has(key: string): boolean;
    get(key: string): IWireData | undefined;
    create(key: string, onReset: WireDataOnReset): IWireData;
    remove(key: string): boolean;
    clear(): Promise<void>;
}
