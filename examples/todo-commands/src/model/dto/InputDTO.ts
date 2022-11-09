class InputDTO {
  private _note: string;
  private _text: string;
  private _completed: boolean;

  get note(): string {
    return this._note;
  }

  get text(): string {
    return this._text;
  }

  get completed(): boolean {
    return this._completed;
  }

  constructor(text: string, note: string, completed = false) {
    this._text = text;
    this._note = note;
    this._completed = completed;
  }
}

export default InputDTO;
