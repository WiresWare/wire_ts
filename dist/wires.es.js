const E = "WR:1001 - Wire already registered, wireId: ", w = "WR:2001 - Middleware already registered, middleware: ", I = "WR:3000 - Listener is null", A = "WR:3001 - WireData value change not allowed - data modification locked with token", g = "WR:3003 - WireData is a getter - it cannot be modified only accessed", f = "WR:3004 - WireData is a getter - setting value together with getter is not allowed", L = "WR:4001 - Cant put already existing instance (unlock first)", y = "WR:4002 - Cant find instance its not set";
class d {
  equal(t) {
    return this === t;
  }
}
class D {
  constructor(t, e, s) {
    this._key = t, this._onRemove = e, this._onReset = s;
  }
  _key;
  _value = void 0;
  _onRemove = void 0;
  _onReset = void 0;
  _getter = void 0;
  _lockToken = void 0;
  _listeners = new Array();
  get isSet() {
    return !!this._value;
  }
  get isLocked() {
    return !!this._lockToken;
  }
  get isGetter() {
    return !!this._getter;
  }
  get key() {
    return this._key;
  }
  get value() {
    return this._value;
  }
  set value(t) {
    this._guardian(), this._value = t, this.refresh();
  }
  set getter(t) {
    this._getter = t;
  }
  lock(t) {
    const e = !this.isLocked || this._lockToken.equal(t);
    return e && (this._lockToken = t), e;
  }
  unlock(t) {
    const e = this.isLocked && this._lockToken.equal(t) || !this.isLocked;
    return e && (this._lockToken = null), e;
  }
  async refresh() {
    if (this._listeners.length !== 0)
      for (const t of this._listeners)
        await t(this._value);
  }
  async reset() {
    this._guardian();
    const t = this._value;
    this._value = void 0, this._onReset(this._key, t), await this.refresh();
  }
  async remove(t = !1) {
    t || this._guardian(), this.value = null, this._lockToken = null, this._onRemove(this._key), this._onRemove = void 0, this._onReset = void 0, await this.refresh(), this._listeners.splice(0, this._listeners.length);
  }
  _guardian() {
    if (this.isLocked)
      throw new Error(this.isGetter ? g : A);
  }
  subscribe(t) {
    return this.hasListener(t) || this._listeners.push(t), this;
  }
  unsubscribe(t) {
    if (t) {
      if (this.hasListener(t)) {
        const e = this._listeners.indexOf(t);
        this._listeners.splice(e, 1);
      }
    } else
      this._listeners.splice(0, this._listeners.length);
    return this;
  }
  hasListener(t) {
    return this._listeners.indexOf(t) > -1;
  }
}
class S {
  constructor(t, e = !1) {
    this._dataList = t, this._noSubscribers = e;
  }
  _dataList;
  _noSubscribers;
  get dataList() {
    return this._dataList;
  }
  get signalHasNoSubscribers() {
    return this._noSubscribers;
  }
}
class p {
  _wireById = /* @__PURE__ */ new Map();
  _wireIdsBySignal = /* @__PURE__ */ new Map();
  add(t) {
    const e = t.id, s = t.signal;
    if (this._wireById.has(e))
      throw new Error(E + e.toString());
    return this._wireById.set(e, t), this._wireIdsBySignal.has(s) || this._wireIdsBySignal.set(s, new Array()), this._wireIdsBySignal.get(s).push(e), t;
  }
  hasSignal(t) {
    return this._wireIdsBySignal.has(t);
  }
  hasWire(t) {
    return this._wireById.has(t.id);
  }
  async send(t, e, s) {
    let i = !0;
    const r = [];
    if (this.hasSignal(t) && this._wireIdsBySignal.has(t)) {
      const _ = [];
      for await (const c of this._wireIdsBySignal.get(t)) {
        const a = this._wireById.get(c);
        s != null && a.scope != s || (i = a.replies > 0 && --a.replies == 0, i && _.push(a), await a.transfer(e));
      }
      if (_.length > 0)
        for await (const c of _)
          i = await this._removeWire(c);
    }
    return new S(r, i);
  }
  async remove(t, e, s) {
    const i = this.hasSignal(t);
    if (i) {
      const r = e != null, n = s != null, _ = [];
      if (this._wireIdsBySignal.has(t)) {
        for await (const a of this._wireIdsBySignal.get(t))
          if (this._wireById.has(a)) {
            const l = this._wireById.get(a), u = r && e != l.scope, R = n && s != l.listener;
            if (u || R)
              continue;
            _.push(l);
          }
      }
      if (_.length > 0)
        for await (const a of _)
          await this._removeWire(a);
    }
    return i;
  }
  async clear() {
    const t = new Array();
    if (this._wireById.forEach((e) => t.push(e)), t.length > 0)
      for await (const e of t)
        await this._removeWire(e);
    this._wireById.clear(), this._wireIdsBySignal.clear();
  }
  getBySignal(t) {
    return this.hasSignal(t) && this._wireIdsBySignal.get(t) ? this._wireIdsBySignal.get(t).map((e) => this._wireById.get(e)) || [] : [];
  }
  getByScope(t) {
    const e = [];
    return this._wireById.forEach((s) => {
      s.scope == t && e.push(s);
    }), e;
  }
  getByListener(t) {
    const e = [];
    return this._wireById.forEach((s) => {
      s.listener == t && e.push(s);
    }), e;
  }
  getByWID(t) {
    return this._wireById.get(t);
  }
  async _removeWire(t) {
    const e = t.id, s = t.signal;
    this._wireById.delete(e);
    const i = this._wireIdsBySignal.get(s) || [];
    i.splice(i.indexOf(e), 1);
    const r = i.length == 0;
    return r && this._wireIdsBySignal.delete(s), await t.clear(), r;
  }
}
class T {
  _MIDDLEWARE_LIST = [];
  has(t) {
    return this._MIDDLEWARE_LIST.indexOf(t) > -1;
  }
  add(t) {
    this._MIDDLEWARE_LIST.push(t);
  }
  clear() {
    this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }
  onData(t, e, s) {
    return this._process((i) => i.onData(t, e, s));
  }
  onReset(t, e) {
    return this._process((s) => s.onData(t, e, null));
  }
  onRemove(t, e, s) {
    return this._process((i) => i.onRemove(t, e, s));
  }
  onSend(t, e) {
    return this._process((s) => s.onSend(t, e));
  }
  onAdd(t) {
    return this._process((e) => e.onAdd(t));
  }
  async _process(t) {
    if (this._MIDDLEWARE_LIST.length > 0)
      for await (const e of this._MIDDLEWARE_LIST)
        await t(e);
  }
}
class M {
  _dataMap = /* @__PURE__ */ new Map();
  has(t) {
    return this._dataMap.has(t);
  }
  get(t) {
    return this._dataMap.get(t);
  }
  create(t, e) {
    return new D(t, this.remove, e);
  }
  remove(t) {
    return this._dataMap.delete(t);
  }
  async clear() {
    const t = [];
    if (this._dataMap.forEach((e) => {
      t.push(e);
    }), t.length > 0)
      for await (const e of t)
        await e.remove(!0);
    this._dataMap.clear();
  }
}
class o {
  constructor(t, e, s, i = 0) {
    this._scope = t, this._signal = e, this._listener = s, this.replies = i, this._id = ++o._INDEX;
  }
  static _INDEX = 0;
  static _COMMUNICATION_LAYER = new p();
  static _DATA_CONTAINER_LAYER = new M();
  static _MIDDLEWARE_LAYER = new T();
  _signal;
  get signal() {
    return this._signal;
  }
  _listener;
  get listener() {
    return this._listener;
  }
  _id;
  get id() {
    return this._id;
  }
  _scope;
  get scope() {
    return this._scope;
  }
  _replies = 0;
  get replies() {
    return this._replies;
  }
  set replies(t) {
    this._withReplies = t > 0, this._replies = t;
  }
  _withReplies = !1;
  get withReplies() {
    return this._withReplies;
  }
  async transfer(t) {
    if (!this._listener)
      throw new Error(I);
    return this._listener(t, this._id);
  }
  clear() {
    this._scope = void 0, this._listener = void 0;
  }
  static attach(t) {
    this._COMMUNICATION_LAYER.add(t);
  }
  static async detach(t) {
    return this.remove(t.signal, t.scope, t.listener);
  }
  static async add(t, e, s, i = 0) {
    const r = new o(t, e, s, i);
    return await this._MIDDLEWARE_LAYER.onAdd(r), this.attach(r), r;
  }
  static async addMany(t, e) {
    for await (const [s, i] of e)
      await o.add(t, s, i);
  }
  static has(t, e) {
    return t ? this._COMMUNICATION_LAYER.hasSignal(t) : e ? this._COMMUNICATION_LAYER.hasWire(e) : !1;
  }
  static async send(t, e, s) {
    return await this._MIDDLEWARE_LAYER.onSend(t, e), this._COMMUNICATION_LAYER.send(t, e, s);
  }
  static async purge(t = !1) {
    await this._COMMUNICATION_LAYER.clear(), await this._DATA_CONTAINER_LAYER.clear(), t && this._MIDDLEWARE_LAYER.clear();
  }
  static async remove(t, e, s) {
    const i = await this._COMMUNICATION_LAYER.remove(t, e, s);
    return i && await this._MIDDLEWARE_LAYER.onRemove(t, e, s), i;
  }
  static async _removeAllBySignal(t, e, s) {
    const i = await this._COMMUNICATION_LAYER.remove(t, e, s);
    return i && await this._MIDDLEWARE_LAYER.onRemove(t, e, s), i;
  }
  static async _removeAllByScope(t) {
    const e = [];
    for await (const s of this._COMMUNICATION_LAYER.getByScope(t))
      e.push(await this._removeAllBySignal(s.signal, t));
    return e;
  }
  static middleware(t) {
    if (!this._MIDDLEWARE_LAYER.has(t))
      this._MIDDLEWARE_LAYER.add(t);
    else
      throw new Error(`${w} ${t.toString()}`);
  }
  static get(t, e, s, i) {
    let r = new Array();
    if (t) {
      const n = this._COMMUNICATION_LAYER.getBySignal(t);
      n && (r = [...r, ...n]);
    }
    if (e) {
      const n = this._COMMUNICATION_LAYER.getByScope(e);
      n && (r = [...r, ...n]);
    }
    if (s) {
      const n = this._COMMUNICATION_LAYER.getByListener(s);
      n && (r = [...r, ...n]);
    }
    if (i) {
      const n = this._COMMUNICATION_LAYER.getByWID(i);
      n && r.push(n);
    }
    return r;
  }
  static data(t, e, s) {
    const i = this._DATA_CONTAINER_LAYER.has(t) ? this._DATA_CONTAINER_LAYER.get(t) : this._DATA_CONTAINER_LAYER.create(t, this._MIDDLEWARE_LAYER.onReset);
    if (s && (i.getter = s, i.lock(new d())), e) {
      if (i.isGetter)
        throw new Error(f);
      const r = i.value, n = typeof e == "function" ? e(r) : e;
      i.value = n, this._MIDDLEWARE_LAYER.onData(t, r, n);
    }
    return i;
  }
  static put(t, e) {
    const s = t.constructor.name;
    if (o.data(s).isLocked)
      throw new Error(L);
    return o.data(s, t).lock(e ?? new d()), t;
  }
  static find(t) {
    const e = t.constructor.name;
    if (!o.data(e).isSet)
      throw new Error(y);
    return o.data(e).value;
  }
}
export {
  o as Wire
};
