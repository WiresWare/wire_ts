class TodoVO {
  get date(): Date {
    return this._date;
  }
  set isCompleted(value: boolean) {
    this._isCompleted = value;
  }
  get isCompleted(): boolean {
    return this._isCompleted;
  }
  set title(value: string) {
    this._title = value;
  }
  get title(): string {
    return this._title;
  }
  get id(): number {
    return this._id;
  }

  private readonly _id: number;
  private readonly _date: Date;
  private _title: string;
  private _isCompleted: boolean;

  constructor(id: number, title: string, date = new Date()) {
    this._id = id;
    this._title = title;
    this._date = date;
    this._isCompleted = false;
  }
}

export default TodoVO;
