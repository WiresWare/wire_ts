class TodoVO {
  static fromJSON(raw: any) {
    const result = new TodoVO(raw._id, raw.text, raw.note, new Date(raw._date), raw.completed);
    // console.log(`> TodoVO -> fromJSON:`, result, raw);
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

  constructor(id: string, title: string, note: string, date = new Date(), completed = false) {
    this._id = id;
    this._date = date;
    this.text = title;
    this.note = note;
    this.completed = completed;
  }
}

export default TodoVO;
