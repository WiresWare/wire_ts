# Wire - communication and data-container layers
These layers consist of string keys that bound to handler's methods and data observers. This is realization of idea of "Strings API" when each component of the system - logical or visual - represented as a set of strings - what's component consumes is "Data API" and "Signals API" is what component producing or reacts on.

## Library aimed to decouple UI from business logic
![Schema](https://github.com/WiresWare/wire_dart/raw/master/assets/wire-schema.jpeg)

It has two layers:
- **Communication Layer** - consists of "signals" (string keys) with associated handlers bound to specific scope - instances of `Wire` object. This layer has main methods: `Wire.add` and `Wire.send`.
- **Data Container Layer** - it is a key-value in-memory map, where each value is an instance of `WireData` - observer that holds dynamic value and can be subscribed for updates, its main method: `Wire.data`.

Read the article on Medium: [Wire of Strings API](https://medium.com/@vladimir.cores/wire-of-strings-api-c4cc1f05cbc6)

## Installation:
```
npm i -D wire-ts
or
yarn add -D wire-ts
```

## Usage:

Steps from diagram's description above. It's example of counter web-application (see folder `./examples/counter`).

#### Steps: 1, 4, 6 - "box" that processes signals:
Adding wires and `WireListener`s to the system. In response, it's immediately set new value to data-container layer from function that do decision-making `Wire.data(CounterDataKeys.COUNT, (oldValue) => newValue)`.

```typescript
class CounterController {
  constructor() {
    // 1. scope, string key, handler function
    Wire.add(this, CounterSignals.INCREASE, (payload: any, wid: number) => {
      // 4. handler function process signal async. 
      // New value could be function or plain value
      Wire.data(CounterDataKeys.COUNT, (value: any): number => {
        const count = value as number;
        // 6. Update data
        return (count ?? 0) + 1;
      });
    });
    // Handler for CounterSignals.DECREASE see in the source code
  }
}
```

Since there is no Model "box" in counter example, the controller updates data by itself in steps 4 and 6.

#### Steps: 2, 7 - View subscribes to data changes and knows how to update itself:

```typescript
class CounterView extends DomElement {
  constructor(component: HTMLElement) {
    super(component);
    const counter = Wire.data(CounterDataKeys.COUNT);
    counter.subscribe(async (value: number) => this.render(value));
    this.render(counter.value);
  }

  render(count: number) {
    this.dom.innerHTML = `${count}`;
  }
}
```

#### Step: 3 - another View translate UI event to a signal:
```typescript
class CounterButton extends DomElement {
  constructor(component: HTMLElement, signal: string) {
    super(component);
    component.onclick = async () => {
      this.button.disabled = true;
      await Wire.send(signal);
      this.button.disabled = false;
    };
  }
  get button(): HTMLButtonElement {
    return this.dom as HTMLButtonElement;
  }
}
```

# WIRE API
### Wire (main static methods):
```
static add(scope: object, signal: string, listener: WireListener, replies = 0): IWire
static addMany(scope: object, signalToHandlerMap: Map<string, WireListener>)
static async send(signal: string, payload?: any | null, scope?: object | null): Promise<IWireSendResults>
static data(key: string, value?: any | null, getter?: WireDataGetter | null): IWireData
```
### Wire (support static methods):
```
static middleware(value: IWireMiddleware): void
static put(instance: object, lock?: IWireDataLockToken): any
static find(instanceType: any): any | Error

static async remove({ signal, scope, listener }): Promise<boolean> 

static attach(wire: IWire): void
static async detach(wire: IWire): Promise<boolean>
async transfer(payload?: any): Promise<void>
static async purge(withMiddleware = false): Promise<void>
static get({ signal, scope, listener, wireId })Array<IWire | undefined>
```
`Wire.send` executes all handlers added to any scope for the signal, executes asynchronous and return result's object `WireSendResults` with data list of length equal to the number of handlers that return not null results, in case of error, the "chain" of consequent transfers to listeners won't be stopped but special `WireSendError` will be added to the `WireSendResults` list (the results object has method - `hasError`). The signal also propagated to all registered middlewares in `onSend(signal: string, payload?: any | null, scope?: object | null): void`;

### WireSendResults
```typescript
interface IWireSendResults {
  get list(): Array<any>;
  get hasError(): boolean;
  get signalHasNoSubscribers(): boolean;
}
```

### WireListener<T>:
Definition of listener to a signal in `Wire.add(scope, signal, listener)`
```typescript
type WireListener = (payload: any, wireId: number) => void;
```

### WireData<T>:
It is a data container that holds dynamic value. WireData can be subscribed (and unsubscribed). It is associated with string key and return `WireData` (instance from in-memory map) when call `Wire.data(key)`. `Wire.data(key)` will always return `WireData` instance, but its **initial value can be null** (if first call does not set value, e.g.`Wire.data(key, null)`), Property `isSet` of `WireData` checks when `!!this._value`. To remove value from Data Container Layer use method `remove()` which set value to `undefined` then synchronously inform middlewares with call on `onData(key, prevValue, undefined)`, after which the instance will be removed from data layer and all listeners cleaned up.

```
subscribe(listener: WireDataListener): WireData
unsubscribe(listener: WireDataListener): WireData

refresh(): void
remove(): void

get value(): any | null | undefined
set value(input: any | null | undefined)

lock(token: WireDataLockToken): boolean
unlock(token: WireDataLockToken): boolean

get isLocked(): boolean
get isGetter(): boolean
get isSet(): boolean

get numberOfListeners(): number
```

### WireDataListener<T>:
Definition of WireData listener in `WireData.subscribe(WireDataListener)`
```
Future<void> Function(dynamic value);
```

### WireMiddleware:
Class that extends WireMiddlewares methods can be added to `Wire.middleware(WireMiddleware)`

```
abstract class WireMiddleware {
  void onAdd(Wire wire);
  void onSend(String signal, [payload, scope]);
  void onRemove(String signal, [Object scope, WireListener listener]);
  void onData(String param, dynamic prevValue, dynamic nextValue);
}
```

## Examples
### 1. Todo MVC:
**Static HTML, MVC and Wire commands**:

[![Example of how thing works in TodoMVC](https://img.youtube.com/vi/G9YCCNSy8Ak/sddefault.jpg)](https://www.youtube.com/watch?v=G9YCCNSy8Ak)
