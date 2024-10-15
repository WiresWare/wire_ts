import { IWire, IWireData, IWireDataLockToken, IWireMiddleware, IWireSendResults } from './interfaces';
import { WireDataGetter, WireListener } from './types';
export default class Wire implements IWire {
    constructor(scope: object, signal: string, listener: WireListener, replies?: number);
    static _INDEX: number;
    private static readonly _COMMUNICATION_LAYER;
    private static readonly _DATA_CONTAINER_LAYER;
    private static readonly _MIDDLEWARE_LAYER;
    private readonly _signal;
    get signal(): string;
    private _listener?;
    listenerEqual(listener: WireListener): boolean;
    private readonly _id;
    get id(): number;
    private _scope?;
    get scope(): object;
    private _replies;
    get replies(): number;
    set replies(value: number);
    private _withReplies;
    get withReplies(): boolean;
    transfer(payload?: any): Promise<any>;
    clear(): void;
    static attach(wire: IWire): void;
    static detach(wire: IWire): Promise<boolean>;
    static add(scope: object, signal: string, listener: WireListener, replies?: number): IWire;
    static many(scope: object, signalToHandlerMapOrObject: Map<string, WireListener> | Record<string, WireListener>): void;
    static has({ signal, wire }: {
        signal?: string;
        wire?: IWire;
    }): boolean;
    static send(signal: string, payload?: any | null, scope?: object | null): Promise<IWireSendResults>;
    static purge(withMiddleware?: boolean): Promise<void>;
    static remove({ signal, scope, listener, }: {
        signal?: string | null;
        scope?: object | null;
        listener?: WireListener | null;
    }): Promise<boolean>;
    static _removeAllBySignal(signal: string, scope?: object, listener?: WireListener | null): Promise<boolean>;
    static _removeAllByScope(scope: object, listener?: WireListener | null): Promise<Array<boolean>>;
    static _removeAllByListener(listener: WireListener): Promise<Array<boolean>>;
    static middleware(value: IWireMiddleware): void;
    static get({ signal, scope, listener, wireId, }: {
        signal?: string | null;
        scope?: object | null;
        listener?: WireListener | null;
        wireId?: number | null;
    }): Array<IWire | undefined>;
    static data(key: string, value?: any | null, getter?: WireDataGetter | null): IWireData;
    static put(instance: object, lock?: IWireDataLockToken): any;
    static find(instanceType: any): any | Error;
}
