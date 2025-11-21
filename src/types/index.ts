import { IWireData } from '../interfaces';

export type WireListener = (payload: any, wireId: number) => void;
export type WireDataValue<T> = T | null | undefined;
export type WireValueFunction<T> = (prevValue: WireDataValue<T>) => void;
export type WireDataListener<T> = (value: WireDataValue<T>) => Promise<void> | void;
export type WireDataGetter<T> = (that: IWireData<T>) => any;
export type WireDataOnRemove = (key: string) => boolean;
export type WireDataOnReset = (that: string, param: any) => any;
