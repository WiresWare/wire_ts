class EditDTO {
  private readonly _id: string;
  private readonly _text: string;
  private readonly _note: string;

  get id(): string {
    return this._id;
  }

  get text(): string {
    return this._text;
  }

  get note(): string {
    return this._note;
  }

  constructor(id: string, text: string, note: string) {
    this._id = id;
    this._text = text;
    this._note = note;
  }
}

export default EditDTO;
