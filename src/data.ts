///
/// Created by Vladimir Cores (Minkin) on 12/06/20.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__DATA_IS_GETTER, ERROR__DATA_IS_LOCKED, ERROR__SUBSCRIBE_TO_DATA_GETTER } from './const';
import { WireDataGetter, WireDataListener, WireDataOnRemove, WireDataOnReset } from './types';
import { IWireData, IWireDatabaseService, IWireDataLockToken, IWireSendResults } from './interfaces';

export class WireDataLockToken implements IWireDataLockToken {
  equal(token: WireDataLockToken): boolean {
    return this === token;
  }
}

export class WireData implements IWireData {
  constructor(key: string, onRemove: WireDataOnRemove, onReset: WireDataOnReset) {
    this._key = key;
    this._onRemove = onRemove;
    this._onReset = onReset;
  }

  private readonly _key: string;
  private _value?: any | null | undefined = undefined;

  private _onRemove?: WireDataOnRemove = undefined;
  private _onReset?: WireDataOnReset = undefined;
  private _getter?: WireDataGetter = undefined;
  private _lockToken?: IWireDataLockToken | null = undefined;

  private readonly _listeners = new Array<WireDataListener>();

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
  get value(): any | null | undefined {
    console.log(`> WireData(${this.key}) -> get value (isGetter: ${this.isGetter}) = ${this._value}`);
    return this.isGetter ? (this._getter as WireDataGetter)(this) : this._value;
  }
  set value(input: any | null | undefined) {
    console.log(
      `> WireData(${this.key}) -> set value: ${input} (typeof value ${typeof input}) : isLocked = ${this.isLocked}`,
    );
    this._guardian();
    this._value = input;
    this.refresh();
  }
  set getter(value: WireDataGetter) {
    console.log(`> WireData(${this.key}) -> set getter`, value);
    this._getter = value;
  }
  get numberOfListeners(): number {
    return this._listeners.length;
  }

  /// Prevent any value modifications inside specific of [WireData] instance.
  /// [WireDataLockToken] token should be stored in some controller or responsible
  /// for modification entity. The purpose of this method is to restrict data changes
  /// only to the place where business logic or model related operations take place.
  lock(wireDataLockToken: IWireDataLockToken): boolean {
    const locked = !this.isLocked || this._lockToken!.equal(wireDataLockToken);
    if (locked) this._lockToken = wireDataLockToken;
    return locked; // throw ERROR__DATA_ALREADY_CLOSED
  }

  /// After calling this method with proper token [WireDataLockToken]
  /// changes to the [WireData] value will be allowed from anywhere of the system
  unlock(wireDataLockToken: IWireDataLockToken): boolean {
    const opened = (this.isLocked && this._lockToken!.equal(wireDataLockToken)) || !this.isLocked;
    if (opened) this._lockToken = null;
    return opened; // throw ERROR__DATA_CANNOT_OPEN
  }

  async refresh(): Promise<void> {
    console.log(`> WireData(${this.key}) -> refresh()`, this, this._listeners);
    if (this._listeners.length === 0) return;
    const valueForListener = this.value;
    for (const listener of this._listeners) {
      // console.log('\t\t refresh: ', listener);
      await listener(valueForListener);
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
    this._value = null;
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

  subscribe(wireDataListener: WireDataListener): IWireData {
    if (this.isGetter) throw new Error(ERROR__SUBSCRIBE_TO_DATA_GETTER);
    if (!this.hasListener(wireDataListener)) {
      this._listeners.push(wireDataListener);
    }
    return this;
  }

  unsubscribe(wireDataListener?: WireDataListener): IWireData {
    if (this.isGetter) throw new Error(ERROR__SUBSCRIBE_TO_DATA_GETTER);
    if (wireDataListener) {
      if (this.hasListener(wireDataListener)) {
        const listenerIndex = this._listeners.indexOf(wireDataListener);
        this._listeners.splice(listenerIndex, 1);
      }
    } else {
      this._listeners.splice(0, this.numberOfListeners);
    }
    return this;
  }

  hasListener(listener: WireDataListener): boolean {
    return this.numberOfListeners > 0 && this._listeners.indexOf(listener) > -1;
  }
}

export class WireSendResults implements IWireSendResults {
  constructor(dataList: Array<any>, noSubscribers = false) {
    this._dataList = dataList;
    this._noSubscribers = noSubscribers;
  }

  private readonly _dataList: Array<any>;
  private readonly _noSubscribers: boolean;

  get dataList() {
    return this._dataList;
  }
  get signalHasNoSubscribers() {
    return this._noSubscribers;
  }
}

export class WireDatabaseService implements IWireDatabaseService {
  async init(key?: string | undefined): Promise<any> {
    return key;
  }
  async exist(key: string): Promise<boolean> {
    return !key;
  }
  async retrieve(key: string): Promise<any> {
    return key;
  }
  async save(key: string, data: any): Promise<any> {
    return { key, data };
  }
  async delete(key: string): Promise<any> {
    return key;
  }
}
