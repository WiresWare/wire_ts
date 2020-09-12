export type WireListener<T> = (payload: T, wireId: number) => void;

export interface WireMiddleware {
  onAdd<T>(wire: Wire<T>):void
  onSend(signal: String, payload?:any, scope?:Object):void
  onRemove<T>(signal:String, scope?:Object, listener?:WireListener<T>):void
  onData(key:String, prevValue?:any, nextValue?:any):void
}

export default class Wire<T> {
  static _INDEX:number = 0

  private readonly _id:number
  get id() { return this._id }

  private _scope?:Object
  get scope() { return this._scope }

  private readonly _signal:String
  get signal() { return this._signal }

  private _listener?:WireListener<T>;
  get listener() { return this._listener }

  public replies:number;

  constructor(scope:Object, signal:String, listener:WireListener<T>, replies?:number) {
    this._scope = scope
    this._signal = signal
    this._listener = listener
    this.replies = replies || 0;
    this._id = ++Wire._INDEX
  }

  transfer(payload?:any):void {
    if (this._listener == undefined) return;
    else if (payload as T || payload == null) {
      this._listener(payload, this._id);
    }
  }
  clear():void {
    this._scope = undefined;
    this._listener = undefined;
  }
}
