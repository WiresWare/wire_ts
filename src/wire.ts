import { WireCommunicateLayer, WireDataContainerLayer } from './layers';
import {
  ERROR__LISTENER_IS_NULL,
  ERROR__MIDDLEWARE_EXISTS,
  ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER,
} from './const';
import { WireData, WireDataLockToken, WireDataGetter } from './data';

export type WireListener<T> = (payload: T, wireId: number) => void;

export interface WireMiddleware {
  onAdd(wire: Wire<any>): Promise<void>;
  onSend(signal: string, payload?: any | null, scope?: object | null): Promise<void>;
  onRemove(signal: string, scope?: object | null, listener?: WireListener<any> | null): Promise<void>;
  onData(key: string, prevValue?: any | null, nextValue?: any | null): Promise<void>;
}

export default class Wire<T> {
  ///
  /// [read-only] [static]
  /// Used to generate Wire wid
  ///
  /// @private
  static _INDEX = 0;
  private static readonly _COMMUNICATION_LAYER = new WireCommunicateLayer();
  private static readonly _DATA_CONTAINER_LAYER = new WireDataContainerLayer();
  private static readonly _MIDDLEWARE_LIST = new Array<WireMiddleware>();

  ///**************************************************
  ///  Protected / Private Properties
  ///**************************************************

  ///
  /// [read-only]
  /// The SIGNAL associated with this Wire.
  ///
  /// @private
  private readonly _signal: string;
  get signal() {
    return this._signal;
  }

  ///
  /// [read-only]
  /// The closure method, reaction to the Wire instance changes.
  ///
  /// @private
  private _listener?: WireListener<T> | null;
  get listener(): WireListener<T> | undefined | null {
    return this._listener;
  }

  ///
  /// [read-only] [internal use]
  /// Unique identification for wire instance.
  ///
  /// @private
  private readonly _id: number;
  get id(): number {
    return this._id;
  }

  ///
  /// [read-only] [internal use]
  /// Scope to which wire belongs to
  ///
  /// @private
  private _scope: Object;
  get scope(): Object {
    return this._scope;
  }

  ///
  /// The number of times that wire instance will respond on signal before being removed.
  /// Default is 0 that means infinity times.
  ///
  public replies: number;

  /// Wire object is a communication unit of the system, each instance associated with a signal
  ///
  /// Wire object can be passed as a reference to any component of the your system
  /// But it wont react on signal until it is attached to the communication layer with [attach]
  /// However you still can send data through it by calling [transfer]
  ///
  constructor(scope: Object, signal: string, listener: WireListener<T>, replies = 0) {
    this._scope = scope;
    this._signal = signal;
    this._listener = listener;
    this.replies = replies;
    this._id = ++Wire._INDEX;
  }

  /// Call associated WireListener with data.
  transfer(payload?: any): void {
    if (!this._listener) throw new Error(ERROR__LISTENER_IS_NULL);
    // Call a listener in this Wire only in case data type match it's listener type.
    const filterByPayloadType: boolean = typeof payload === T || payload == null;
    if (filterByPayloadType) this._listener(payload, this._id);
  }

  clear(): void {
    this._scope = undefined;
    this._listener = undefined;
  }

  ///**********************************************************************************************************
  ///
  ///  Public Static Methods - API
  ///
  ///**********************************************************************************************************

  /// Add wire object to the communication layer
  static attach(wire: Wire<any>): void {
    this._COMMUNICATION_LAYER.add(wire);
  }

  /// Remove wire object from communication layer, then inform all middlewares with
  /// Returns existence of another wires with that signal.
  static detach(wire: Wire<any>): boolean {
    return this.remove(wire.signal, wire.scope, wire.listener);
  }

  /// Create wire object from params and [attach] it to the communication layer
  /// All middleware will be informed from [WireMiddleware.onAdd] before wire is attached to the layer
  static add<T>(scope: Object, signal: string, listener: WireListener<T>, replies = 0): Wire<T> {
    const wire = new Wire<T>(scope, signal, listener, replies);
    this._MIDDLEWARE_LIST.forEach((middleware) => middleware.onAdd(wire));
    this.attach(wire);
    return wire;
  }

  /// Check if signal string or wire instance exists in communication layer
  static has(signal?: string | null, wire?: Wire<any> | null): boolean {
    if (signal) return this._COMMUNICATION_LAYER.hasSignal(signal);
    if (wire) return this._COMMUNICATION_LAYER.hasWire(wire);
    return false;
  }

  /// Send signal through all wires has the signal string value
  /// Payload is optional, default is null, passed to WireListener from [transfer]
  /// If use scope then only wire with this scope value will receive the payload
  /// All middleware will be informed from [WireMiddleware.onSend] before signal sent on wires
  ///
  /// Returns true when no wire for the signal has found
  static send(signal: string, payload?: any | null, scope?: Object | null): boolean {
    this._MIDDLEWARE_LIST.forEach((middleware) => middleware.onSend(signal, payload));
    return this._COMMUNICATION_LAYER.send(signal, payload, scope);
  }

  /// Remove all entities from Communication Layer and Data Container Layer
  /// @param [withMiddleware] used to remove all middleware
  static purge(withMiddleware = false): void {
    this._COMMUNICATION_LAYER.clear();
    this._DATA_CONTAINER_LAYER.clear();
    if (withMiddleware) this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }

  /// Remove all wires for specific signal, for more precise target to remove add scope and/or listener
  /// All middleware will be informed from [WireMiddleware.onRemove] after signal removed, only if existed
  /// Returns [bool] telling signal existed in communication layer
  static remove(signal: string, scope?: Object, listener?: WireListener<any>): boolean {
    const existed = this._COMMUNICATION_LAYER.remove(signal, scope, listener);
    if (existed) {
      this._MIDDLEWARE_LIST.forEach((m) => m.onRemove(signal, scope, listener));
    }
    return existed;
  }

  /// Class extending [WireMiddleware] can listen to all processes in side Wire
  static middleware(value: WireMiddleware): void {
    if (this._MIDDLEWARE_LIST.indexOf(value) < 0) {
      this._MIDDLEWARE_LIST.push(value);
    } else {
      throw new Error(`${ERROR__MIDDLEWARE_EXISTS} ${value.toString()}`);
    }
  }

  /// When you need Wires associated with signal or scope or listener
  /// Returns [List<Wire>]
  static get(
    signal?: string | null,
    scope?: Object | null,
    listener?: WireListener<any> | null,
    wireId?: number | null,
  ): Array<Wire<any> | undefined> {
    let result = new Array<Wire<any> | undefined>();
    if (signal) {
      const instances = this._COMMUNICATION_LAYER.getBySignal(signal);
      instances && (result = [...result, ...instances]);
    }
    if (scope) {
      const instances = this._COMMUNICATION_LAYER.getByScope(scope);
      instances && (result = [...result, ...instances]);
    }
    if (listener) {
      const instances = this._COMMUNICATION_LAYER.getByListener(listener);
      instances && (result = [...result, ...instances]);
    }
    if (wireId) {
      const instance = this._COMMUNICATION_LAYER.getByWID(wireId);
      instance && result.push(instance);
    }
    return result;
  }

  /// Access to the data container, retrieve WireData object when value is null and set when is not
  /// [WireData] is a data container to changes of which anyone can subscribe/unsubscribe.
  /// It's associated with string key.
  /// [WireData] can't be null and Wire.data(key) will always return WireData instance.
  /// Initial value will be null and special property of [WireData] isSet equal to false until any value is set
  /// If value is null then delete method of [WireData] will be called, object will be removed from system
  /// To protect [WireData] from being set from unappropriated places the [WireDataLockToken] token introduced.
  /// When only specific object want have rights to write/change value of [WireData] it can create [WireDataLockToken] object
  /// and pass it to [Wire.data] method as option parameter `token` to validate the assign action.
  /// [WireData] API:
  /// ```
  /// WireData subscribe(WireDataListener listener)
  /// WireData unsubscribe([WireDataListener listener])
  /// void setValue(T input, { DataModificationToken token })
  /// void refresh()
  /// void remove()
  /// ```
  /// Returns [WireData]
  static data<T>(key: string, value?: any | null, getter: WireDataGetter<T> = null): WireData<T> {
    const wireData: WireData<T> | undefined = this._DATA_CONTAINER_LAYER.has(key)
      ? this._DATA_CONTAINER_LAYER.get<T>(key)
      : this._DATA_CONTAINER_LAYER.create<T>(key);

    if (getter) {
      wireData!.value = getter;
      wireData!.lock(new WireDataLockToken());
    }
    if (value) {
      if (wireData!.isGetter) throw new Error(ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER);
      const prevValue = wireData!.value;
      const nextValue = typeof value === 'function' ? value(prevValue) : value;
      wireData!.value = nextValue;
      this._MIDDLEWARE_LIST.forEach((m) => m.onData(key, prevValue, nextValue));
    }
    return wireData!;
  }
}
