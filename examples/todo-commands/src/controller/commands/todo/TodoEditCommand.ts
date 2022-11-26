import { Wire, WireCommand } from 'cores.wire';
import EditDTO from '@/model/data/dto/EditDTO';

class TodoEditCommand extends WireCommand<boolean> {
  private readonly _editDTO: EditDTO;
  constructor(editDTO: EditDTO) {
    super();
    this._editDTO = editDTO;
  }

  async execute(): Promise<boolean> {
    const text = this._editDTO.text;
    const note = this._editDTO.note;
    const id = this._editDTO.id;
    const isEmpty = text?.length === 0 && note?.length === 0;
    console.log(`> TodoEditCommand -> execute: id = ${id}, isEmpty = ${isEmpty}`);
    if (!isEmpty) {
      const todoVO = Wire.data(id).value;
      todoVO.text = text;
      todoVO.note = note;
      Wire.data(id, todoVO);
    }
    return isEmpty;
  }
}

export default TodoEditCommand;
