# Wire - communication and data-container layers
These layers consist of string keys that bound to handler's methods and data observers. This is realization of idea of "Strings API" when each component of the system - logical or visual - represented as a set of strings - what's component consumes is "Data API" and "Signals API" is what component producing or reacts on.

## Library aimed to decouple UI from business logic
![Schema](https://github.com/WiresWare/wire_dart/raw/master/assets/wire-schema.jpeg)

It has two layers:
- **Communication Layer** - consists of "signals" (string keys) with associated handlers bound to specific scope - instances of `Wire` object. This layer has main methods: `Wire.add` and `Wire.send`.
- **Data Container Layer** - it is a key-value in-memory map, where each value is an instance of `WireData` - observer that holds dynamic value and can be subscribed for updates, its main method: `Wire.data`.

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
It is a data container that holds dynamic value. WireData can be subscribed (and unsubscribed). It is associated with string key and retrieved from in-memory map with `Wire.data(key)`. WireData **can't** be null and `Wire.data(key)` will always return WireData instance, but its **initial value can be null** (if first call does not have value, e.g.`Wire.data(key, null)`), to check this initial null value WireData has special property `isSet`, which is `false` until not null value won't be set for the first time. To remove value from Data Container Layer use method `remove()` - it emits null value before remove subscribers and WireData instance, use `isSet` property to distinguish between newly created (false) and removed.

```
WireData subscribe(WireDataListener<T> listener)
WireData unsubscribe(WireDataListener<T> listener)
void refresh()
void remove()
dynamic get value
bool lock(WireDataLockToken token)
bool unlock(WireDataLockToken token)
bool get WireData.isLocked
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
