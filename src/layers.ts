import Wire, { WireListener } from './wire'
import { WireData } from './data'
import { ERROR__WIRE_ALREADY_REGISTERED } from './const'

export class WireCommunicateLayer {
  private _wireById:Map<number, Wire<any>> = new Map()
  private _wireIdsBySignal:Map<String, Array<number>> = new Map()

  add(wire:Wire<any>) {
    const wireId = wire.id;
    const signal = wire.signal;

    if (this._wireById.has(wireId)) {
      throw new Error(ERROR__WIRE_ALREADY_REGISTERED + wireId.toString())
    }

    this._wireById.set(wireId, wire)

    if (!this._wireIdsBySignal.has(signal)) {
      this._wireIdsBySignal.set(signal, new Array<number>());
    }

    this._wireIdsBySignal.get(signal)?.push(wireId)

    return wire;
  }

  hasSignal(signal:String):boolean {
    return this._wireIdsBySignal.has(signal)
  }

  hasWire(wire:Wire<any>):boolean {
    return this._wireById.has(wire.id)
  }

  send(signal:String, payload?:any, scope?:Object):boolean {
    let noMoreSubscribers = true
    if (this.hasSignal(signal)) {
      const wiresToRemove = new Array<Wire<any>>()
      this._wireIdsBySignal.get(signal)?.forEach((wireId) => {
        const wire = this._wireById.get(wireId) as Wire<any>;
        if (scope != null && wire.scope != scope) return;
        noMoreSubscribers = wire.replies > 0 && --wire.replies == 0;
        if (noMoreSubscribers) wiresToRemove.push(wire);
        wire.transfer(payload);
      })
      wiresToRemove.forEach((w) => { noMoreSubscribers = this._removeWire(w) });
    }
    return noMoreSubscribers
  }

  remove(signal:String, scope?:Object, listener?:WireListener<any>):boolean {
    let exists = this.hasSignal(signal)
    if (exists) {
      const wiresToRemove = new Array<Wire<any>>()
      this._wireIdsBySignal.get(signal)?.forEach((wireId) => {
        const wire = this._wireById.get(wireId)
        if (wire == undefined) return;
        const isWrongScope = scope != null && scope != wire.scope
        const isWrongListener = listener != null && listener != wire.listener
        if (isWrongScope || isWrongListener) return
        wiresToRemove.push(wire)
      })
      wiresToRemove.forEach((wire) => this._removeWire(wire))
    }
    return exists
  }

  clear():void {
    const wireToRemove = new Array<Wire<any>>()
    this._wireById.forEach((wire, _) => wireToRemove.push(wire))
    wireToRemove.forEach(this._removeWire)
    this._wireById.clear()
    this._wireIdsBySignal.clear()
  }

  getBySignal(signal:String):(Wire<any> | undefined)[] {
    if (this.hasSignal(signal) && this._wireIdsBySignal.get(signal))
      return this._wireIdsBySignal.get(signal)?.map(
        (wireId) => this._wireById.get(wireId)) || new Array<Wire<any>>()

    return new Array<Wire<any>>()
  }

  getByScope(scope:Object):Array<Wire<any>> | undefined {
    const result = new Array<Wire<any>>();
    this._wireById.forEach((wire) => {
      if (wire.scope == scope) result.push(wire)
    });
    return result
  }

  getByListener(listener:WireListener<any>):Array<Wire<any>> | undefined {
    const result = new Array<Wire<any>>()
    this._wireById.forEach((wire) => {
      if (wire.listener == listener) result.push(wire)
    })
    return result
  }

  getByWID(wireId:number):Wire<any> | undefined {
    return this._wireById.get(wireId)
  }

  _removeWire(wire:Wire<any>):boolean {
    const wireId = wire.id
    const signal = wire.signal

    // Remove Wire by wid
    this._wireById.delete(wireId)

    // Remove wid for Wire signal
    const wireIdsForSignal:Array<number> = this._wireIdsBySignal.get(signal) || []
    wireIdsForSignal.splice(wireIdsForSignal.indexOf(wireId), 1)

    const noMoreSignals = wireIdsForSignal.length == 0
    if (noMoreSignals) this._wireIdsBySignal.delete(signal)

    wire.clear()

    return noMoreSignals
  }
}

export class WireDataContainerLayer {
  private _dataMap = new Map<String, WireData<any>>();

  has(key:String):boolean { return this._dataMap.has(key)!; }
  get<T>(key:String):WireData<T> | undefined { return this._dataMap.get(key)!; }
  create<T>(key:String):WireData<T> { return new WireData<T>(key, this.remove); }
  remove(key:String):boolean { return this._dataMap.delete(key); }

  clear():void {
    this._dataMap.forEach((wireData) => {
      wireData.remove();
    })
    this._dataMap.clear();
  }
}
