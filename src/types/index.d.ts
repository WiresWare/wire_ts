import { IWireData } from '../interfaces';
export type WireListener = (payload: any, wireId: number) => void;
export type WireValueFunction = (prevValue: any | null | undefined) => void;
export type WireDataListener = (value: any | null | undefined) => Promise<void>;
export type WireDataGetter = (that: IWireData) => any;
export type WireDataOnRemove = (key: string) => boolean;
export type WireDataOnReset = (that: string, param: any) => any;
