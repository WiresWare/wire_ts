class DomElement {
  private readonly _dom: HTMLElement;
  get dom() {
    return this._dom;
  }

  constructor(dom: HTMLElement) {
    this._dom = dom;
  }
}

export default DomElement;
