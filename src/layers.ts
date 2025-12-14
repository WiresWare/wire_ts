///
/// Created by Vladimir Cores (Minkin) on 31/10/22.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__ERROR_DURING_PROCESSING_SEND, ERROR__WIRE_ALREADY_REGISTERED } from './const';
import { IWire, IWireData, IWireMiddleware, IWireSendError, IWireSendResults } from './interfaces';
import { WireDataOnListenerError, WireDataOnReset, WireListener } from './types';
import { WireData, WireSendResults, WireSendError } from './data';

export class WireCommunicateLayer {
  private _wireById = new Map<number, IWire>();
  private _wireIdsBySignal = new Map<string, Array<number>>();

  add(wire: IWire): IWire {
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
  hasWire(wire: IWire): boolean {
    return this._wireById.has(wire.id);
  }
  async send(signal: string, payload?: any | null, scope?: object | null): Promise<IWireSendResults> {
    let noMoreSubscribers = true;
    const results: any[] = [];
    if (this.hasSignal(signal)) {
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        const isLookingInScope = scope != null;
        const wireIdsList = this._wireIdsBySignal.get(signal)!;
        for await (const wireId of wireIdsList) {
          const wire = this._wireById.get(wireId) as IWire;
          if (isLookingInScope && wire.scope !== scope) continue;
          const result = await wire.transfer(payload).catch(this._processSendError);
          noMoreSubscribers = wire.replies > 0 && --wire.replies === 0 && (await this._removeWire(wire));
          if (result !== null && result !== undefined) {
            results.push(result);
          }
        }
      }
    }
    return new WireSendResults(results, noMoreSubscribers);
  }
  private _processSendError(err: any): IWireSendError {
    return new WireSendError(ERROR__ERROR_DURING_PROCESSING_SEND, err);
  }

  async remove(signal: string, scope?: object, listener?: WireListener | null): Promise<boolean> {
    const exists = this.hasSignal(signal);
    if (exists) {
      const withScope = scope != null;
      const withListener = listener != null;
      const toRemoveList: IWire[] = [];
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        for await (const wireId of this._wireIdsBySignal.get(signal)!) {
          if (this._wireById.has(wireId)) {
            const wire = this._wireById.get(wireId) as IWire;
            const isWrongScope = withScope && scope !== wire.scope;
            const isWrongListener = withListener && !wire.listenerEqual(listener);
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
    const wireToRemove = new Array<IWire>();
    this._wireById.forEach((wire) => wireToRemove.push(wire));
    if (wireToRemove.length > 0)
      for await (const wire of wireToRemove) {
        await this._removeWire(wire);
      }
    this._wireById.clear();
    this._wireIdsBySignal.clear();
  }
  getBySignal(signal: string): (IWire | undefined)[] {
    if (this.hasSignal(signal)) {
      return this._wireIdsBySignal.get(signal)!.map((wireId) => {
        return this._wireById.get(wireId);
      });
    }
    return [];
  }
  getByScope(scope: object): Array<IWire> | undefined {
    const result: IWire[] = [];
    this._wireById.forEach((wire) => {
      if (wire.scope === scope) result.push(wire);
    });
    return result;
  }
  getByListener(listener: WireListener): Array<IWire> | undefined {
    const result: IWire[] = [];
    this._wireById.forEach((wire) => {
      if (wire.listenerEqual(listener)) result.push(wire);
    });
    return result;
  }
  getByWID(wireId: number): IWire | undefined {
    return this._wireById.get(wireId);
  }
  ///
  /// Exclude a Wire based on a signal.
  ///
  /// @param    The Wire to remove.
  /// @return If there is no ids (no Wires) for that SIGNAL stop future perform
  ///
  async _removeWire(wire: IWire): Promise<boolean> {
    const wireId = wire.id;
    const signal = wire.signal;

    // Remove Wire by wid
    this._wireById.delete(wireId);

    // Remove wid for Wire signal
    const wireIdsForSignal: Array<number> = this._wireIdsBySignal.get(signal) || [];
    wireIdsForSignal.splice(wireIdsForSignal.indexOf(wireId), 1);

    const noMoreSignals = wireIdsForSignal.length === 0;
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
  clear(): void {
    this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }
  onData(key: string, prevValue: any, nextValue: any): void {
    return this._process((m: IWireMiddleware) => m.onData(key, prevValue, nextValue));
  }
  onReset(key: string, prevValue: any): void {
    return this.onData(key, prevValue, undefined);
  }
  onRemove(signal: string, scope?: object, listener?: WireListener | null): void {
    return this._process((m: IWireMiddleware) => m.onRemove(signal, scope, listener));
  }
  onSend(signal: string, payload: any): void {
    return this._process((m: IWireMiddleware) => m.onSend(signal, payload));
  }
  onAdd(wire: IWire): void {
    return this._process((m: IWireMiddleware) => m.onAdd(wire));
  }
  onListenerError(error: Error, key: string, value: any): void {
    return this._process((m: IWireMiddleware) => m.onListenerError(error, key, value));
  }
  _process(p: (mw: IWireMiddleware) => void): void {
    if (this._MIDDLEWARE_LIST.length > 0) {
      for (const mw of this._MIDDLEWARE_LIST) {
        p(mw);
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
    return this._dataMap.get(key) as IWireData<T> | undefined;
  }

  create<T>(key: string, onReset: WireDataOnReset, onListenerError: WireDataOnListenerError): IWireData<T> {
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: create ${key}`);
    const wireData = new WireData<T>(key, (key) => this.remove(key), onReset, onListenerError);
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
