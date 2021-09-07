///
/// Created by Vladimir Cores (Minkin) on 12/06/20.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__DATA_IS_GETTER, ERROR__DATA_IS_LOCKED } from "./const"

export type WireDataListener<T> = (value:T) => void;
export type WireDataGetter<T> = (that:WireData<T>) => T;

export class WireDataLockToken {
  equal(token:WireDataLockToken):boolean {
    return this === token;
  }
}

export class WireData<T> {
  private _onRemove:Function
  private readonly _listeners = new Array<WireDataListener<T>>()

  private _isSet:boolean = false
  get isSet():boolean { return this._isSet }

  private _key:string
  get key():string { return this._key }

  private _lockToken?:WireDataLockToken | null = null
  get isLocked():boolean { return !!this._lockToken }

  get isGetter():boolean { return typeof this._value === 'function' }

  /// Prevent any value modifications inside specific of [WireData] instance.
  /// [WireDataLockToken] token should be stored in some controller or responsible
  /// for modification entity. The purpose of this method is to restrict data changes
  /// only to the place where business logic or model related operations take place.
  lock(token:WireDataLockToken):boolean {
    const locked = !this.isLocked || this._lockToken!.equal(token);
    if (locked) this._lockToken = token;
    return locked; // throw ERROR__DATA_ALREADY_CLOSED
  }

  /// After calling this method with proper token [WireDataLockToken]
  /// changes to the [WireData] value will be allowed from anywhere of the system
  unlock(token:WireDataLockToken):boolean {
    const opened = (this.isLocked && this._lockToken!.equal(token)) || !this.isLocked;
    if (opened) this._lockToken = null;
    return opened; // throw ERROR__DATA_CANNOT_OPEN
  }

  private _value:T | WireDataGetter<T>
  get value():T | WireDataGetter<T> { return this._value }
  set value(input:any) {
    this._guardian()
    this._value = input
    this._isSet = true
    this.refresh()
  }

  constructor(key:String, onRemove:Function) {
    this._key = key
    this._onRemove = onRemove
  }

  refresh():void {
    this._listeners.forEach((listener) =>
      listener(this._value))
  }

  remove(clean = false):void {
    if (!clean) this._guardian();

    this._onRemove!(this._key)
    delete this._onRemove

    delete this._key
    this.value = null
    this._lockToken = null;
    this.refresh();
    this._listeners.splice(0, this._listeners.length)
  }

  private _guardian():void {
    if (this.isLocked) throw new Error(this.isGetter
      ? ERROR__DATA_IS_GETTER : ERROR__DATA_IS_LOCKED);
  }

  subscribe(listener:WireDataListener<T>):WireData<T> {
    if (!this.hasListener(listener)) this._listeners.push(listener)
    return this
  }

  unsubscribe(listener?:WireDataListener<T>):WireData<T> {
    if (!!listener) {
      if (this.hasListener(listener)) this._listeners.splice(
        this._listeners.indexOf(listener), 1)
    } else {
      this._listeners.splice(0, this._listeners.length)
    }
    return this
  }

  hasListener(listener:WireDataListener<T>):boolean {
    return this._listeners.indexOf(listener) > -1;
  }
}
