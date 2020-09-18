import { WireCommunicateLayer, WireDataContainerLayer } from './layers'
import { ERROR__MIDDLEWARE_EXISTS } from './const'
import { WireData } from './data'

export type WireListener = (payload:any, wireId: number) => void;

export interface WireMiddleware {
  onAdd(wire: Wire):void
  onSend(signal: String, payload?:any, scope?:Object):void
  onRemove(signal:String, scope?:Object, listener?:WireListener):void
  onData(key:String, prevValue?:any, nextValue?:any):void
}

class wire {
  ///
  /// [read-only] [static]
  /// Used to generate Wire wid
  ///
  /// @private
  static _INDEX:number = 0
  static _COMMUNICATION_LAYER = new WireCommunicateLayer();
  static _DATA_CONTAINER_LAYER = new WireDataContainerLayer();
  static _MIDDLEWARE_LIST = new Array<WireMiddleware>();

  ///**************************************************
  ///  Protected / Private Properties
  ///**************************************************

  ///
  /// [read-only]
  /// The SIGNAL associated with this Wire.
  ///
  /// @private
  private readonly _signal:String
  get signal() { return this._signal }

  ///
  /// [read-only]
  /// The closure method that this item was associated.
  ///
  /// @private
  private _listener?:WireListener;
  get listener() { return this._listener }

  ///
  /// [read-only] [internal use]
  /// Unique identification for wire instance.
  ///
  /// @private
  private readonly _id:number
  get id() { return this._id }

  ///
  /// [read-only] [internal use]
  /// Scope to which wire belongs to
  ///
  /// @private
  private _scope?:Object
  get scope() { return this._scope }

  ///
  /// The number of times that wire instance will respond on signal before being removed.
  /// Default is 0 that means infinity times.
  ///
  public replies:number;

  /// Wire object is a communication unit of the system, each instance associated with a signal
  ///
  /// Wire object can be passed as a reference to any component of the your system
  /// But it wont react on signal until it is attached to the communication layer with [attach]
  /// However you still can send data through it by calling [transfer]
  ///
  constructor(scope:Object, signal:String, listener:WireListener, replies:number = 0) {
    this._scope = scope
    this._signal = signal
    this._listener = listener
    this.replies = replies;
    this._id = ++wire._INDEX
  }

  /// Call associated WireListener with data.
  transfer(payload?:any):void {
    if (this._listener == undefined) return;
    // Call a listener in this Wire only in case data type match it's listener type.
    // if (payload is T || payload == null)
    this._listener(payload, this._id);
  }

  clear():void {
    this._scope = undefined;
    this._listener = undefined;
  }

  ///**********************************************************************************************************
  ///
  ///  Public Static Methods - API
  ///
  ///**********************************************************************************************************

  /// Add wire object to the communication layer
  static attach(wire:Wire):void {
    this._COMMUNICATION_LAYER.add(wire);
  }

  /// Remove wire object from communication layer, returns existence.
  static detach(wire:Wire):boolean {
    return this._COMMUNICATION_LAYER.remove(wire.signal, wire.scope, wire.listener);
  }

  /// Create wire object from params and [attach] it to the communication layer
  /// All middleware will be informed from [WireMiddleware.onAdd] before wire is attached to the layer
  static add(
    scope:Object,
    signal:String,
    listener:WireListener,
    replies:number = 0
  ):Wire {
    const instance = new wire(scope, signal, listener, replies);
    this._MIDDLEWARE_LIST.forEach((m) => m.onAdd(instance));
    this.attach(instance);
    return instance;
  }

  /// Check if signal string or wire instance exists in communication layer
  static has(signal:String, wire:Wire):boolean {
    if (signal != null) return this._COMMUNICATION_LAYER.hasSignal(signal);
    if (wire != null) return this._COMMUNICATION_LAYER.hasWire(wire);
    return false;
  }

  /// Send signal through all wires has the signal string value
  /// Payload is optional, default is null, passed to WireListener from [transfer]
  /// If use scope then only wire with this scope value will receive the payload
  /// All middleware will be informed from [WireMiddleware.onSend] before signal sent on wires
  /// Returns true when no wire for the signal has found
  static send(signal:String, payload:any = null, scope:Object):boolean {
    this._MIDDLEWARE_LIST.forEach((m) => m.onSend(signal, payload));
    return this._COMMUNICATION_LAYER.send(signal, payload, scope);
  }

  /// Remove all entities from Communication Layer and Data Container Layer
  /// @param [withMiddleware] used to remove all middleware
  static purge(withMiddleware:Boolean = false):void {
    this._COMMUNICATION_LAYER.clear();
    this._DATA_CONTAINER_LAYER.clear();
    if (withMiddleware)
      this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }

  /// Remove all wires for specific signal, for more precise target to remove add scope and/or listener
  /// All middleware will be informed from [WireMiddleware.onRemove] after signal removed, only if existed
  /// Returns [bool] telling signal existed in communication layer
  static remove(signal:String, scope:Object, listener:WireListener):boolean {
    const existed = this._COMMUNICATION_LAYER.remove(signal, scope, listener);
    if (existed) {
      this._MIDDLEWARE_LIST.forEach((m) => m.onRemove(signal, scope, listener));
    }
    return existed;
  }

  /// Class extending [WireMiddleware] can listen to all processes in side Wire
  static middleware(value:WireMiddleware):void {
    if (this._MIDDLEWARE_LIST.indexOf(value) < 0) {
      this._MIDDLEWARE_LIST.push(value);
    } else {
      throw `${ERROR__MIDDLEWARE_EXISTS} ${value.toString()}`;
    }
  }

  /// When you need Wires associated with signal or scope or listener
  /// Returns [List<Wire>]
  static get(
    signal:String,
    scope:Object,
    listener:WireListener,
    wireId:number
  ):Array<Wire | undefined> {
    let result = new Array<Wire | undefined>();
    if (signal != null) {
      let instances = this._COMMUNICATION_LAYER.getBySignal(signal);
      instances && (result = [...result, ...instances]);
    }
    if (scope != null) {
      let instances = this._COMMUNICATION_LAYER.getByScope(scope);
      instances && (result = [...result, ...instances]);
    }
    if (listener != null) {
      let instances = this._COMMUNICATION_LAYER.getByListener(listener);
      instances && (result = [...result, ...instances]);
    }
    if (wireId != null) {
      let instance = this._COMMUNICATION_LAYER.getByWID(wireId);
      instance && result.push(instance);
    }
    return result;
  }

  /// Access to the data container, retrieve WireData object when value is null and set when is not
  /// [WireData] is a data container to changes of which anyone can subscribe/unsubscribe.
  /// It's associated with string key.
  /// WireData can't be null and Wire.data(key) will always return WireData instance.
  /// Initial value will be null and special property of WireData isSet is false until not null value is set for the first time
  /// [WireData] API:
  /// ```
  /// WireData subscribe(WireDataListener listener)
  /// WireData unsubscribe([WireDataListener listener])
  /// void refresh()
  /// void remove()
  /// ```
  /// Returns [WireData]
  static data(key:String, value:any):WireData {
    const wireData = this._DATA_CONTAINER_LAYER.get(key);
    if (value != null && wireData !== undefined) {
      const prevValue = wireData.value;
      const nextValue = (typeof value === 'function') ? value(prevValue) : value;
      this._MIDDLEWARE_LIST.forEach((m) => m.onData(key, prevValue, nextValue));
      wireData.value = nextValue;
    }
    return wireData as WireData;
  }
}

export type Wire = wire
