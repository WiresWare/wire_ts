import { WireDataGetter, WireListener } from '../types';

export interface IWireCommand<T> {
  execute(): Promise<T | null>;
}

export interface IWireDataLockToken {
  equal(token: IWireDataLockToken): boolean;
}

export interface IWireData<T> {
  get isSet(): boolean;
  get isLocked(): boolean;
  get isGetter(): boolean;
  get key(): string;
  get value(): T | null | undefined;
  set value(input: T | null | undefined);
  set getter(value: WireDataGetter<T>);

  lock(token: IWireDataLockToken): boolean;
  unlock(token: IWireDataLockToken): boolean;

  refresh(): Promise<void>;
  reset(): Promise<void>;
  remove(clean: boolean): Promise<void>;
}

export interface IWireDatabaseService {
  init(key: string): Promise<boolean>;
  exist(key: string): boolean;
  retrieve(key: string): Promise<any>;
  save(key: string, data: any): void;
  delete(key: string): void;
}

export interface IWire<T> {
  get signal(): string;
  get listener(): WireListener<T> | undefined | null;
  get id(): number;
  get scope(): object;
  get replies(): number;
  set replies(value: number);
  get withReplies(): boolean;

  transfer(payload?: any): Promise<void>;
  clear(): void;
}

export interface IWireMiddleware {
  onAdd(wire: IWire<any>): Promise<void>;
  onSend(signal: string, payload?: any | null, scope?: object | null): Promise<void>;
  onRemove(signal: string, scope?: object | null, listener?: WireListener<any> | null): Promise<void>;
  onData(key: string, prevValue?: any | null, nextValue?: any | null): Promise<void>;
}

export interface IWireWithWhenReady {
  whenReady: Promise<boolean>;
}

export interface IWireWithDatabase {
  exist(key: string): boolean;
  retrieve(key: string): Promise<any>;
  persist(key: string, value: any): void;
  delete(key: string): void;
}

export interface IWireWithWireData {
  getData<T>(dataKey: string): IWireData<T>;
  has(dataKey: string): boolean;
  hasNot(dataKey: string): boolean;
  get<T>(dataKey: string): Promise<T>;
  getMany(many: string[]): Promise<Map<string, any>>;
  update(dataKey: string, data: any, refresh: boolean): Promise<void>;
  reset(dataKey: string): Promise<void>;
  remove(dataKey: string): Promise<void>;
}

export interface IWireSendResults {
  get dataList(): Array<any>;
  get signalHasNoSubscribers(): boolean;
}
