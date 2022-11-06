///
/// Created by Vladimir Cores (Minkin) on 12/06/20.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__DATA_IS_GETTER, ERROR__DATA_IS_LOCKED } from './const';
import { WireDataGetter, WireDataListener, WireDataOnRemove, WireDataOnReset } from './types';
import { IWireData, IWireDataLockToken } from './interfaces';

export class WireDataLockToken implements IWireDataLockToken {
  equal(token: WireDataLockToken): boolean {
    return this === token;
  }
}

export class WireData<T> implements IWireData<T> {
  constructor(key: string, onRemove: WireDataOnRemove, onReset: WireDataOnReset<T>) {
    this._key = key;
    this._onRemove = onRemove;
    this._onReset = onReset;
  }

  private readonly _key: string;
  private _value?: T | null | undefined = undefined;

  private _onRemove?: WireDataOnRemove = undefined;
  private _onReset?: WireDataOnReset<T> = undefined;
  private _getter?: WireDataGetter<T> = undefined;
  private _lockToken?: IWireDataLockToken | null = undefined;

  private readonly _listeners = new Array<WireDataListener<T>>();

  /// This property needed to distinguish between newly created and not set WireData which has value of null at the beginning
  /// And with WireData at time when it's removed, because when removing the value also set to null
  get isSet(): boolean {
    return !!this._value;
  }
  get isLocked(): boolean {
    return !!this._lockToken;
  }
  get isGetter(): boolean {
    return !!this._getter;
  }
  get key(): string {
    return this._key;
  }
  get value(): T | null | undefined {
    console.log(`> WireData -> get value: ${this._value}`);
    return this._value;
  }
  set value(input: T | null | undefined) {
    console.log(`> WireData -> set value: ${input} (typeof value ${typeof input}) : isLocked = ${this.isLocked}`);
    this._guardian();
    this._value = input;
    this.refresh();
  }
  set getter(value: WireDataGetter<T>) {
    this._getter = value;
  }

  /// Prevent any value modifications inside specific of [WireData] instance.
  /// [WireDataLockToken] token should be stored in some controller or responsible
  /// for modification entity. The purpose of this method is to restrict data changes
  /// only to the place where business logic or model related operations take place.
  lock(token: IWireDataLockToken): boolean {
    const locked = !this.isLocked || this._lockToken!.equal(token);
    if (locked) this._lockToken = token;
    return locked; // throw ERROR__DATA_ALREADY_CLOSED
  }

  /// After calling this method with proper token [WireDataLockToken]
  /// changes to the [WireData] value will be allowed from anywhere of the system
  unlock(token: IWireDataLockToken): boolean {
    const opened = (this.isLocked && this._lockToken!.equal(token)) || !this.isLocked;
    if (opened) this._lockToken = null;
    return opened; // throw ERROR__DATA_CANNOT_OPEN
  }

  async refresh(): Promise<void> {
    if (this._listeners.length === 0) return;
    for (const listener of this._listeners) {
      await listener(this._value);
    }
  }

  async reset(): Promise<void> {
    this._guardian();
    const previousValue = this._value;
    this._value = undefined;
    this._onReset!(this._key, previousValue);
    await this.refresh();
  }

  async remove(clean = false): Promise<void> {
    if (!clean) this._guardian();
    this.value = null;
    this._lockToken = null;
    this._onRemove!(this._key);
    this._onRemove = undefined;
    this._onReset = undefined;
    await this.refresh();
    this._listeners.splice(0, this._listeners.length);
  }

  private _guardian(): void {
    if (this.isLocked) throw new Error(this.isGetter ? ERROR__DATA_IS_GETTER : ERROR__DATA_IS_LOCKED);
  }

  subscribe(listener: WireDataListener<T>): IWireData<T> {
    if (!this.hasListener(listener)) {
      this._listeners.push(listener);
    }
    return this;
  }

  unsubscribe(listener?: WireDataListener<T>): IWireData<T> {
    if (listener) {
      if (this.hasListener(listener)) {
        const listenerIndex = this._listeners.indexOf(listener);
        this._listeners.splice(listenerIndex, 1);
      }
    } else {
      this._listeners.splice(0, this._listeners.length);
    }
    return this;
  }

  hasListener(listener: WireDataListener<T>): boolean {
    return this._listeners.indexOf(listener) > -1;
  }
}
