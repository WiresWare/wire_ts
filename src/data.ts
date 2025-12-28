///
/// Created by Vladimir Cores (Minkin) on 12/06/20.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__DATA_IS_GETTER, ERROR__DATA_IS_LOCKED, ERROR__SUBSCRIBE_TO_DATA_GETTER } from './const';
import {
  WireDataListenersExecutionMode,
  WireDataGetter,
  WireDataListener,
  WireDataOnRemove,
  WireDataOnReset,
  WireDataValue,
  WireDataOnError,
} from './types';
import { IWireData, IWireDatabaseService, IWireDataLockToken, IWireSendResults, IWireSendError } from './interfaces';

export class WireDataLockToken implements IWireDataLockToken {
  equal(token: WireDataLockToken): boolean {
    return this === token;
  }
}

export class WireData<T> implements IWireData<T> {
  constructor(
    key: string,
    onRemove: WireDataOnRemove,
    onReset: WireDataOnReset,
    onError: WireDataOnError,
  ) {
    this._key = key;
    this._onRemove = onRemove;
    this._onReset = onReset;
    this._onError = onError;
  }

  private readonly _key: string;
  private _value: WireDataValue<T> = undefined;

  private _onRemove?: WireDataOnRemove = undefined;
  private _onReset?: WireDataOnReset = undefined;
  private _onError?: WireDataOnError = undefined;
  private _getter?: WireDataGetter<T> = undefined;
  private _lockToken?: IWireDataLockToken | null = undefined;
  private _listenersExecutionMode: WireDataListenersExecutionMode = WireDataListenersExecutionMode.SEQUENTIAL;

  private _refreshQueue: Promise<any>[] = [];

  private readonly _listeners = new Array<WireDataListener<T>>();

  /// This property needed to distinguish between newly created and not set WireData which has value of null at the beginning
  /// And with WireData at time when it's removed, because when removing the value also set to null
  get isSet(): boolean {
    return this._value !== undefined && this._value !== null;
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
  get value(): WireDataValue<T> {
    console.log(`> WireData(${this.key}) -> get value (isGetter: ${this.isGetter}) = ${this._value}`);
    return this.isGetter ? (this._getter as WireDataGetter<T>)(this) : this._value;
  }
  set value(input: WireDataValue<T>) {
    console.log(
      `> WireData(${this.key}) -> set value: ${input} (typeof value ${typeof input}) : isLocked = ${this.isLocked}`,
    );
    this._guardian();
    this._value = input;
    const promise = this.refresh(this._value)
      .finally(() => {
        const index = this._refreshQueue.indexOf(promise);
        if (index !== -1) this._refreshQueue.splice(index, 1);
      });
    this._refreshQueue.push(promise);
  }
  set getter(value: WireDataGetter<T>) {
    console.log(`> WireData(${this.key}) -> set getter`, value);
    this._getter = value;
  }
  get listenersExecutionMode(): WireDataListenersExecutionMode {
    return this._listenersExecutionMode;
  }
  set listenersExecutionMode(mode: WireDataListenersExecutionMode) {
    this._listenersExecutionMode = mode;
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
    return locked;
  }
  /// After calling this method with proper token [WireDataLockToken]
  /// changes to the [WireData] value will be allowed from anywhere of the system
  unlock(wireDataLockToken: IWireDataLockToken): boolean {
    const opened = (this.isLocked && this._lockToken!.equal(wireDataLockToken)) || !this.isLocked;
    if (opened) this._lockToken = null;
    return opened;
  }
  async refresh(value: WireDataValue<T>): Promise<void> {
    console.log(`> WireData(${this.key}) -> refresh()`, this);
    if (this._listeners.length === 0) return;
    const listeners = [...this._listeners];
    if (this._listenersExecutionMode === WireDataListenersExecutionMode.PARALLEL) {
      const results = await Promise.allSettled(
        listeners.map(async (listener) => {
          return listener(value);
        }),
      );
      results.forEach((result) => {
        if (result.status === 'rejected') {
          this._onError!(result.reason, this.key, value);
        }
      });
    } else {
      for await (const listener of listeners) {
        await Promise.resolve(listener(value)).catch((error: any) => {
          this._onError!(error, this.key, value);
        });
      }
    }
  }
  async reset(): Promise<void> {
    this._guardian();
    const previousValue = this._value;
    this._value = undefined;
    this._onReset!(this._key, previousValue);
    await this.refresh(this._value);
  }
  async remove(clean = false): Promise<void> {
    if (!clean) this._guardian();
    this._lockToken = null;
    await this.reset();
    this._refreshQueue = [];
    this._onRemove!(this._key);
    this._onRemove = undefined;
    this._onReset = undefined;
    this._onError = undefined;
    this._listeners.splice(0, this._listeners.length);
  }
  private _guardian(): void {
    if (this.isLocked) throw new Error(this.isGetter ? ERROR__DATA_IS_GETTER : ERROR__DATA_IS_LOCKED);
  }
  subscribe(wireDataListener: WireDataListener<T>): IWireData<T> {
    if (this.isGetter) throw new Error(ERROR__SUBSCRIBE_TO_DATA_GETTER);
    console.log(`> WireData(${this.key}) -> subscribe:`, { wireDataListener, hasListener: this.hasListener(wireDataListener) });
    if (!this.hasListener(wireDataListener)) {
      this._listeners.push(wireDataListener);
    }
    return this;
  }
  async unsubscribe(wireDataListener?: WireDataListener<T>): Promise<IWireData<T>> {
    if (this.isGetter) throw new Error(ERROR__SUBSCRIBE_TO_DATA_GETTER);
    if (wireDataListener) {
      if (this.hasListener(wireDataListener)) {
        const remove = async(): Promise<void> => {
          const listenerIndex = this._listeners.indexOf(wireDataListener);
          console.log(`> WireData(${this.key}) -> unsubscribe:`, {
            listener: wireDataListener,
            at: listenerIndex,
          });
          this._listeners.splice(listenerIndex, 1);
        };
        console.log(`> WireData(${this.key}) -> unsubscribe:`, this._refreshQueue);
        const numberToRefreshes = this._refreshQueue.length;
        if (numberToRefreshes > 0) {
          const lastRefreshIndex = numberToRefreshes - 1;
          await this._refreshQueue[lastRefreshIndex].finally(remove);
        } else {
          await remove();
        }
      }
    } else {
      this._listeners.splice(0, this.numberOfListeners);
    }
    return this;
  }
  hasListener(listener: WireDataListener<T>): boolean {
    return this.numberOfListeners > 0 && this._listeners.indexOf(listener) > -1;
  }
}

export class WireSendError implements IWireSendError {
  private readonly _error: Error;
  private readonly _message: string;
  get message(): string {
    return this._message;
  }
  get error(): Error {
    return this._error;
  }
  constructor(message: string, error: Error) {
    this._message = message;
    this._error = error;
  }
}

export class WireSendResults implements IWireSendResults {
  constructor(dataList: Array<any>, noSubscribers = false) {
    this._list = dataList;
    this._noSubscribers = noSubscribers;
  }

  private readonly _list: Array<any>;
  private readonly _noSubscribers: boolean;

  get hasError(): boolean {
    return this._list.some((item) => item instanceof WireSendError);
  }
  get list(): any[] {
    return this._list;
  }
  get errors(): WireSendError[] {
    return this._list.filter((item) => item instanceof WireSendError);
  }
  get signalHasNoSubscribers(): boolean {
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
