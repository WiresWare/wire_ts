///
/// Created by Vladimir Cores (Minkin) on 31/10/22.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__WIRE_ALREADY_REGISTERED } from './const';
import { IWire, IWireData, IWireMiddleware, IWireSendResults } from './interfaces';
import { WireDataOnReset, WireListener } from './types';
import { WireSendResults } from './wire';
import { WireData } from './data';

export class WireCommunicateLayer {
  private _wireById = new Map<number, IWire<any>>();
  private _wireIdsBySignal = new Map<string, Array<number>>();

  add(wire: IWire<any>): IWire<any> {
    const wireId = wire.id;
    const signal = wire.signal;

    if (this._wireById.has(wireId)) {
      throw new Error(ERROR__WIRE_ALREADY_REGISTERED + wireId.toString());
    }

    this._wireById.set(wireId, wire);

    if (!this._wireIdsBySignal.has(signal)) {
      this._wireIdsBySignal.set(signal, new Array<number>());
    }

    this._wireIdsBySignal.get(signal)!.push(wireId);

    return wire;
  }

  hasSignal(signal: string): boolean {
    return this._wireIdsBySignal.has(signal);
  }

  hasWire(wire: IWire<any>): boolean {
    return this._wireById.has(wire.id);
  }

  async send(signal: string, payload?: any, scope?: object | null): Promise<IWireSendResults> {
    let noMoreSubscribers = true;
    const results: any[] = [];
    if (this.hasSignal(signal)) {
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        const wiresToRemove: IWire<any>[] = [];
        for await (const wireId of this._wireIdsBySignal.get(signal)!) {
          const wire = this._wireById.get(wireId) as IWire<any>;
          if (scope != null && wire.scope != scope) continue;
          noMoreSubscribers = wire.replies > 0 && --wire.replies == 0;
          if (noMoreSubscribers) wiresToRemove.push(wire);
          await wire.transfer(payload);
        }
        if (wiresToRemove.length > 0)
          for await (const wire of wiresToRemove) {
            noMoreSubscribers = await this._removeWire(wire);
          }
      }
    }
    return new WireSendResults(results, noMoreSubscribers);
  }

  async remove(signal: string, scope?: object, listener?: WireListener<any>): Promise<boolean> {
    const exists = this.hasSignal(signal);
    if (exists) {
      const withScope = scope != null;
      const withListener = listener != null;
      const toRemoveList: IWire<any>[] = [];
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        for await (const wireId of this._wireIdsBySignal.get(signal)!) {
          if (this._wireById.has(wireId)) {
            const wire = this._wireById.get(wireId) as IWire<any>;
            const isWrongScope = withScope && scope != wire.scope;
            const isWrongListener = withListener && listener != wire.listener;
            if (isWrongScope || isWrongListener) continue;
            toRemoveList.push(wire);
          }
        }
      }
      if (toRemoveList.length > 0)
        for await (const wire of toRemoveList) {
          await this._removeWire(wire);
        }
    }
    return exists;
  }

  async clear(): Promise<void> {
    const wireToRemove = new Array<IWire<any>>();
    this._wireById.forEach((wire) => wireToRemove.push(wire));
    if (wireToRemove.length > 0)
      for await (const wire of wireToRemove) {
        await this._removeWire(wire);
      }
    this._wireById.clear();
    this._wireIdsBySignal.clear();
  }

  getBySignal(signal: string): (IWire<any> | undefined)[] {
    if (this.hasSignal(signal) && this._wireIdsBySignal.get(signal))
      return (
        this._wireIdsBySignal.get(signal)!.map((wireId) => {
          return this._wireById.get(wireId);
        }) || []
      );
    return [];
  }

  getByScope(scope: object): Array<IWire<any>> | undefined {
    const result: IWire<any>[] = [];
    this._wireById.forEach((wire) => {
      if (wire.scope == scope) result.push(wire);
    });
    return result;
  }

  getByListener(listener: WireListener<any>): Array<IWire<any>> | undefined {
    const result: IWire<any>[] = [];
    this._wireById.forEach((wire) => {
      if (wire.listener == listener) result.push(wire);
    });
    return result;
  }

  getByWID(wireId: number): IWire<any> | undefined {
    return this._wireById.get(wireId);
  }

  ///
  /// Exclude a Wire based on a signal.
  ///
  /// @param    The Wire to remove.
  /// @return If there is no ids (no Wires) for that SIGNAL stop future perform
  ///
  async _removeWire(wire: IWire<any>): Promise<boolean> {
    const wireId = wire.id;
    const signal = wire.signal;

    // Remove Wire by wid
    this._wireById.delete(wireId);

    // Remove wid for Wire signal
    const wireIdsForSignal: Array<number> = this._wireIdsBySignal.get(signal) || [];
    wireIdsForSignal.splice(wireIdsForSignal.indexOf(wireId), 1);

    const noMoreSignals = wireIdsForSignal.length == 0;
    if (noMoreSignals) this._wireIdsBySignal.delete(signal);

    await wire.clear();

    return noMoreSignals;
  }
}

export class WireMiddlewaresLayer {
  private readonly _MIDDLEWARE_LIST: IWireMiddleware[] = [];

  has(middleware: IWireMiddleware): boolean {
    return this._MIDDLEWARE_LIST.indexOf(middleware) > -1;
  }
  add(middleware: IWireMiddleware): void {
    this._MIDDLEWARE_LIST.push(middleware);
  }
  clear() {
    this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }
  onData(key: string, prevValue: any, nextValue: any) {
    return this._process((m: IWireMiddleware) => m.onData(key, prevValue, nextValue));
  }
  onReset(key: string, prevValue: any) {
    return this._process((m: IWireMiddleware) => m.onData(key, prevValue, null));
  }
  onRemove(signal: string, scope?: object, listener?: WireListener<any>) {
    return this._process((m: IWireMiddleware) => m.onRemove(signal, scope, listener));
  }
  onSend(signal: string, payload: any) {
    return this._process((m: IWireMiddleware) => m.onSend(signal, payload));
  }
  onAdd(wire: IWire<any>) {
    return this._process((m: IWireMiddleware) => m.onAdd(wire));
  }

  async _process(p: (mw: IWireMiddleware) => void): Promise<void> {
    if (this._MIDDLEWARE_LIST.length > 0) {
      for await (const mw of this._MIDDLEWARE_LIST) {
        await p(mw);
      }
    }
  }
}

export class WireDataContainerLayer {
  private _dataMap = new Map<string, IWireData<any>>();

  has(key: string): boolean {
    const result = this._dataMap.has(key);
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: has ${key} = ${result}`);
    return result!;
  }
  get<T>(key: string): IWireData<T> | undefined {
    return this._dataMap.get(key)!;
  }
  create<T>(key: string, onReset: WireDataOnReset<any>): IWireData<T> {
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: create ${key}`);
    const wireData = new WireData<T>(key, this.remove, onReset);
    this._dataMap.set(key, wireData);
    return wireData;
  }
  remove(key: string): boolean {
    return this._dataMap.delete(key);
  }

  async clear(): Promise<void> {
    const wireDataToRemove: IWireData<any>[] = [];
    this._dataMap.forEach((wireData) => {
      wireDataToRemove.push(wireData);
    });
    if (wireDataToRemove.length > 0)
      for await (const wireData of wireDataToRemove) {
        await wireData.remove(true);
      }
    this._dataMap.clear();
  }
}
