import { WireDataGetter, WireDataListener, WireListener } from '../types';

export interface IWireCommand {
  execute(): Promise<any | null>;
}

export interface IWireDataLockToken {
  equal(token: IWireDataLockToken): boolean;
}

export interface IWireData {
  get isSet(): boolean;
  get isLocked(): boolean;
  get isGetter(): boolean;
  get key(): string;
  get value(): any | null | undefined;
  set value(input: any | null | undefined);
  set getter(value: WireDataGetter);

  lock(token: IWireDataLockToken): boolean;
  unlock(token: IWireDataLockToken): boolean;

  refresh(): Promise<void>;
  reset(): Promise<void>;
  remove(clean?: boolean | false): Promise<void>;

  subscribe(listener: WireDataListener): IWireData;
  unsubscribe(listener?: WireDataListener): IWireData;
  hasListener(listener: WireDataListener): boolean;
}

export interface IWireDatabaseService {
  init(key?: string | undefined): Promise<boolean>;
  exist(key: string): Promise<boolean>;
  retrieve(key: string): Promise<any>;
  save(key: string, data: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface IWire {
  get signal(): string;
  get id(): number;
  get scope(): object;
  get replies(): number;
  set replies(value: number);
  get withReplies(): boolean;

  listenerEqual(listener: WireListener): boolean;
  transfer(payload?: any): Promise<void>;
  clear(): void;
}

export interface IWireMiddleware {
  onAdd(wire: IWire): Promise<void>;
  onSend(signal: string, payload?: any | null, scope?: object | null): Promise<void>;
  onRemove(signal: string, scope?: object | null, listener?: WireListener | null): Promise<void>;
  onData(key: string, prevValue?: any | null, nextValue?: any | null): Promise<void>;
}

export interface IWireWithWhenReady {
  whenReady: Promise<boolean>;
}

export interface IWireWithDatabase {
  exist(key: string): Promise<boolean>;
  retrieve(key: string): Promise<any>;
  persist(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface IWireWithWireData {
  getData(dataKey: string): IWireData;
  has(dataKey: string): boolean;
  hasNot(dataKey: string): boolean;
  get(dataKey: string): Promise<any>;
  getMany(many: string[]): Promise<Map<string, any>>;
  update(dataKey: string, data: any, refresh: boolean): Promise<void>;
  reset(dataKey: string): Promise<void>;
  remove(dataKey: string): Promise<void>;
}

export interface IWireSendResults {
  get dataList(): Array<any>;
  get signalHasNoSubscribers(): boolean;
}
