import { IWireData } from '../interfaces';
export declare type WireListener = (payload: any, wireId: number) => void;
export declare type WireValueFunction = (prevValue: any | null | undefined) => void;
export declare type WireDataListener = (value: any | null | undefined) => Promise<void>;
export declare type WireDataGetter = (that: IWireData) => any;
export declare type WireDataOnRemove = (key: string) => boolean;
export declare type WireDataOnReset = (that: string, param: any) => any;
