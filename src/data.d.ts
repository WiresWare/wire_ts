import { WireDataGetter, WireDataListener, WireDataOnRemove, WireDataOnReset } from './types';
import { IWireData, IWireDatabaseService, IWireDataLockToken, IWireSendResults, IWireSendError } from './interfaces';
export declare class WireDataLockToken implements IWireDataLockToken {
    equal(token: WireDataLockToken): boolean;
}
export declare class WireData implements IWireData {
    constructor(key: string, onRemove: WireDataOnRemove, onReset: WireDataOnReset);
    private readonly _key;
    private _value?;
    private _onRemove?;
    private _onReset?;
    private _getter?;
    private _lockToken?;
    private readonly _listeners;
    get isSet(): boolean;
    get isLocked(): boolean;
    get isGetter(): boolean;
    get key(): string;
    get value(): any | null | undefined;
    set value(input: any | null | undefined);
    set getter(value: WireDataGetter);
    get numberOfListeners(): number;
    lock(wireDataLockToken: IWireDataLockToken): boolean;
    unlock(wireDataLockToken: IWireDataLockToken): boolean;
    refresh(): Promise<void>;
    reset(): Promise<void>;
    remove(clean?: boolean): Promise<void>;
    private _guardian;
    subscribe(wireDataListener: WireDataListener): IWireData;
    unsubscribe(wireDataListener?: WireDataListener): IWireData;
    hasListener(listener: WireDataListener): boolean;
}
export declare class WireSendError implements IWireSendError {
    private readonly _error;
    private readonly _message;
    get message(): string;
    get error(): Error;
    constructor(message: string, error: Error);
}
export declare class WireSendResults implements IWireSendResults {
    constructor(dataList: Array<any>, noSubscribers?: boolean);
    private readonly _list;
    private readonly _noSubscribers;
    get hasError(): boolean;
    get list(): any[];
    get signalHasNoSubscribers(): boolean;
}
export declare class WireDatabaseService implements IWireDatabaseService {
    init(key?: string | undefined): Promise<any>;
    exist(key: string): Promise<boolean>;
    retrieve(key: string): Promise<any>;
    save(key: string, data: any): Promise<any>;
    delete(key: string): Promise<any>;
}
