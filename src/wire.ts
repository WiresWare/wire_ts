export type WireListener = (payload:any, wireId: number) => void;

export interface WireMiddleware {
  onAdd(wire: Wire):void
  onSend(signal: String, payload?:any, scope?:Object):void
  onRemove(signal:String, scope?:Object, listener?:WireListener):void
  onData(key:String, prevValue?:any, nextValue?:any):void
}

class wire {
  static _INDEX:number = 0

  private readonly _id:number
  get id() { return this._id }

  private _scope?:Object
  get scope() { return this._scope }

  private readonly _signal:String
  get signal() { return this._signal }

  private _listener?:WireListener;
  get listener() { return this._listener }

  public replies:number;

  constructor(scope:Object, signal:String, listener:WireListener, replies:number = 0) {
    this._scope = scope
    this._signal = signal
    this._listener = listener
    this.replies = replies;
    this._id = ++wire._INDEX
  }

  transfer(payload?:any):void {
    if (this._listener == undefined) return;

    this._listener(payload, this._id);
  }

  clear():void {
    this._scope = undefined;
    this._listener = undefined;
  }
}

export type Wire = wire
