import { WireDataGetter, WireDataLockToken } from "@/data";

declare module 'wires'{
  interface WireData {
    get isSet(): boolean;
    get isLocked(): boolean;
    get isGetter(): boolean;
    get key(): string;
    get value(): T | null | undefined;
    set value(input: T | null | undefined);
    set getter(value: WireDataGetter<T>);

    lock(token: WireDataLockToken): boolean;
    unlock(token: WireDataLockToken): boolean;

    refresh(): Promise<void>;
    reset(): Promise<void>;
  }
}
