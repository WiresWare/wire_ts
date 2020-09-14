import { Wire, WireListener } from './wire'

export class WireCommunicateLayer {
  private _wireById:Map<number, Wire> = new Map()
  private _wireIdsBySignal:Map<String, Array<number>> = new Map()

  add(wire:Wire) {
    const wireId = wire.id;
    const signal = wire.signal;

    if (this._wireById.has(wireId)) {
      throw 'ERROR__WIRE_ALREADY_REGISTERED' + wireId.toString()
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

  hasWire(wire:Wire):boolean {
    return this._wireById.has(wire.id)
  }

  send(signal:String, payload?:any, scope?:Object):boolean {
    let noMoreSubscribers = true
    if (this.hasSignal(signal)) {
      const WiresToRemove = new Array<Wire>()
      this._wireIdsBySignal.get(signal)?.forEach((wireId) => {
        const wire = this._wireById.get(wireId) as Wire;
        if (scope != null && wire.scope != scope) return;
        noMoreSubscribers = wire.replies > 0 && --wire.replies == 0;
        if (noMoreSubscribers) WiresToRemove.push(wire);
        wire.transfer(payload);
      })
      WiresToRemove.forEach((w) => { noMoreSubscribers = this._removeWire(w) });
    }
    return true
  }

  remove(signal:String, scope?:Object, listener?:WireListener):boolean {
    let exists = this.hasSignal(signal)
    if (exists) {
      const wiresToRemove = new Array<Wire>()
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
    const wireToRemove = new Array<Wire>()
    this._wireById.forEach((wire, _) => wireToRemove.push(wire))
    wireToRemove.forEach(this._removeWire)
    this._wireById.clear()
    this._wireIdsBySignal.clear()
  }

  getBySignal(signal:String):(Wire | undefined)[] {
    if (this.hasSignal(signal) && this._wireIdsBySignal.get(signal))
      return this._wireIdsBySignal.get(signal)?.map(
        (wireId) => this._wireById.get(wireId)) || new Array<Wire>()

    return new Array<Wire>()
  }

  getByScope(scope:Object):Array<Wire> | undefined {
    const result = new Array<Wire>();
    this._wireById.forEach((wire) => {
      if (wire.scope == scope) result.push(wire)
    });
    return result
  }

  getByListener(listener:WireListener):Array<Wire> | undefined {
    const result = new Array<Wire>()
    this._wireById.forEach((wire) => {
      if (wire.listener == listener) result.push(wire)
    })
    return result
  }

  getByWID(wid:number):Wire | undefined {
    return this._wireById.get(wid)
}

  _removeWire(wire:Wire):boolean {
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
