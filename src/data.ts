export type WireDataListener = (value:any) => void;

export class WireData {
  private _onRemove:Function
  private readonly _listeners = new Array<WireDataListener>()

  private _isSet:boolean = false
  get isSet() { return this._isSet }

  private _key:String
  get key() { return this._key }

  private _value:any
  get value() { return this._value }
  set value(input:any) {
    this._value = input
    this._isSet = true
    this.refresh()
  }

  constructor(key:String, onRemove:Function) {
    this._key = key
    this._onRemove = onRemove
  }

  refresh():void {
    this._listeners.forEach((l) => l(this._value));
  }

  remove():void {
    this._onRemove(this._key)
    delete this._onRemove
    delete this._key
    this.value = null
    this._listeners.splice(0, this._listeners.length)
  }

  subscribe(listener:WireDataListener):WireData {
    if (!this.hasListener(listener)) this._listeners.push(listener);
    return this;
  }

  unsubscribe(listener?:WireDataListener):WireData {
    if (listener != null) {
      if (this.hasListener(listener)) this._listeners.splice(
        this._listeners.indexOf(listener), 1)
    } else {
      this._listeners.splice(0, this._listeners.length)
    }
    return this;
  }

  hasListener(listener:WireDataListener):boolean {
    return this._listeners.indexOf(listener) > -1;
  }
}
