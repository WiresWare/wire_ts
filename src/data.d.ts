import { WireDataGetter, WireDataListener, WireDataOnRemove, WireDataOnReset } from './types';
import { IWireData, IWireDatabaseService, IWireDataLockToken, IWireSendResults, IWireSendError } from './interfaces';
export declare class WireDataLockToken implements IWireDataLockToken {
    equal(token: WireDataLockToken): boolean;
}
export declare class WireData<T> implements IWireData<T> {
    constructor(key: string, onRemove: WireDataOnRemove, onReset: WireDataOnReset);
    private readonly _key;
    private _value?;
    private _onRemove?;
    private _onReset?;
    private _getter?;
    private _lockToken?;
    private _refreshQueue;
    private readonly _listeners;
    get isSet(): boolean;
    get isLocked(): boolean;
    get isGetter(): boolean;
    get key(): string;
    get value(): T | null | undefined;
    set value(input: T | null | undefined);
    set getter(value: WireDataGetter<T>);
    get numberOfListeners(): number;
    lock(wireDataLockToken: IWireDataLockToken): boolean;
    unlock(wireDataLockToken: IWireDataLockToken): boolean;
    refresh(): Promise<void>;
    reset(): Promise<void>;
    remove(clean?: boolean): Promise<void>;
    private _guardian;
    subscribe(wireDataListener: WireDataListener): IWireData<T>;
    unsubscribe(wireDataListener?: WireDataListener): Promise<IWireData<T>>;
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
    get errors(): WireSendError[];
    get signalHasNoSubscribers(): boolean;
}
export declare class WireDatabaseService implements IWireDatabaseService {
    init(key?: string | undefined): Promise<any>;
    exist(key: string): Promise<boolean>;
    retrieve(key: string): Promise<any>;
    save(key: string, data: any): Promise<any>;
    delete(key: string): Promise<any>;
}
