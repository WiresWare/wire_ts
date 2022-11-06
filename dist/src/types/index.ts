import { IWireData } from '../interfaces';

export type WireListener<T> = (payload: T, wireId: number) => void;
export type WireValueFunction<T> = (prevValue: T | null | undefined) => void;
export type WireDataListener<T> = (value: T | null | undefined) => Promise<void>;
export type WireDataGetter<T> = (that: IWireData<T>) => T;
export type WireDataOnRemove = (key: string) => boolean;
export type WireDataOnReset<T> = (that: string, param: any) => T;
