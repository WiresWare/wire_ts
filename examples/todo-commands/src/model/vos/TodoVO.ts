class TodoVO {
  static fromJSON(raw: any) {
    const result = new TodoVO(raw.id, raw.text, raw.note, new Date(raw.date), raw.completed);
    result.visible = raw.visible;
    console.log(`> TodoVO -> fromJSON:`, result);
    return result;
  }

  get date(): Date {
    return this._date;
  }
  get id(): string {
    return this._id;
  }

  private readonly _id: string;
  private readonly _date: Date;

  public text: string;
  public note: string;
  public completed: boolean;

  public visible: boolean;

  constructor(id: string, title: string, note: string, date = new Date(), completed = false) {
    this._id = id;
    this._date = date;
    this.text = title;
    this.note = note;
    this.completed = completed;
    this.visible = true;
  }
}

export default TodoVO;
