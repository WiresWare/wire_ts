export type WireDataValue<T> = T | null | undefined;
export type WireDataGetter<T> = (wireData: any) => WireDataValue<T>;
export type WireDataListener<T> = (value: WireDataValue<T>) => void | Promise<void>;
export type WireDataOnReset = (key: string, prevValue: any) => void;
export type WireDataOnRemove = (key: string) => void;
export type WireDataOnListenerError = (error: Error, key: string, value: any) => void;

export enum WireDataListenersExecutionMode {
  SEQUENTIAL,
  PARALLEL,
}

export type WireListener = (...args: any[]) => any;
