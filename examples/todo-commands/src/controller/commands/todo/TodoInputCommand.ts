import { Wire, WireCommand } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';
import ViewSignals from '@/consts/ViewSignals';

import InputDTO from '@/model/dto/InputDTO';
import TodoVO from '@/model/vos/TodoVO';

class TodoInputCommand extends WireCommand {
  private inputDTO: InputDTO;
  constructor(inputDTO: InputDTO) {
    super();
    this.inputDTO = inputDTO;
  }

  async execute() {
    const text = this.inputDTO.text;
    if (text?.length > 0) {
      const note = this.inputDTO.note;
      const completed = this.inputDTO.completed;

      const newTodoId = `todo-${Date.now().toString()}`;
      const newTodoVO = new TodoVO(newTodoId, text, note, new Date(), completed);

      const todoIdsList = Wire.data(DataKeys.LIST_OF_IDS).value || [];
      const currentCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value || 0;
      const notCompletedCount = currentCount + (completed ? 0 : 1);

      todoIdsList.push(newTodoVO.id);

      console.log(`> TodoInputCommand -> execute: currentCount = ${currentCount}`);
      console.log(`> TodoInputCommand -> execute: todoIdsList = ${todoIdsList}`);

      // Add object to data layer by id
      Wire.data(newTodoVO.id, newTodoVO);
      // Update TodoList in data layer
      Wire.data(DataKeys.LIST_OF_IDS, todoIdsList);
      // Update counter
      Wire.data(DataKeys.NOT_COMPLETED_COUNT, notCompletedCount);
      // Send signal to clean input
      await Wire.send(ViewSignals.CLEAR_INPUT);
    } else {
      // Signalise about error or wrong input
    }
  }
}

export default TodoInputCommand;
