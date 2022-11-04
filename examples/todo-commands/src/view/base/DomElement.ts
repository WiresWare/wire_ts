class DomElement {
  private readonly _dom: HTMLElement;
  constructor(dom: HTMLElement) {
    this._dom = dom;
  }
  get dom(): HTMLElement {
    return this._dom;
  }
}

export default DomElement;
