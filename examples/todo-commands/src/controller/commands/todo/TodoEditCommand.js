import { Wire, WireCommand } from 'cores.wire';
import TodoDeleteCommand from '@/mvc/controller/commands/todo/TodoDeleteCommand';

class TodoEditCommand extends WireCommand {
  constructor(editDTO) {
    super();
    this.editDTO = editDTO;
  }

  async execute() {
    const text = this.editDTO.text;
    const note = this.editDTO.note;
    const id = this.editDTO.id;
    console.log(`> TodoEditCommand -> execute: id = ${id}`);
    if (text?.length > 0) {
      const todoVO = Wire.data(id).value;
      todoVO.text = text;
      todoVO.note = note;
      Wire.data(id, todoVO);
    } else {
      return new TodoDeleteCommand(id).execute();
    }
  }
}

export default TodoEditCommand;
