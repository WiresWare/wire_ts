import { WireDataGetter, WireDataLockToken } from "@/data";
import { WireDatabaseService, WireMiddleware } from '@/wire'
import { WireWithWhenReady } from '@/with'
import { WireCommand } from '@/command'

declare module '@wire/core'{
  export type { WireDatabaseService, WireMiddleware, WireWithWhenReady, WireDataGetter, WireCommand }
  export interface WireData {
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
