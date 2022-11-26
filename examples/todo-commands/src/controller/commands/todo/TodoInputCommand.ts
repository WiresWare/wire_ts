import { Wire, WireCommand } from 'cores.wire';

import DataKeys from '@/constants/DataKeys';

import InputDTO from '@/model/data/dto/InputDTO';
import TodoVO from '@/model/data/vos/TodoVO';
import FilterValues from '@/constants/FilterValues';

class TodoInputCommand extends WireCommand<boolean> {
  private readonly _inputDTO: InputDTO;
  constructor(inputDTO: InputDTO) {
    super();
    this._inputDTO = inputDTO;
  }

  async execute(): Promise<boolean> {
    const text = this._inputDTO.text;
    const isNotEmpty = text?.length > 0;
    if (isNotEmpty) {
      const note = this._inputDTO.note;
      const completed = this._inputDTO.completed;

      const newTodoId = `todo-${Date.now().toString()}`;
      const newTodoVO = new TodoVO(newTodoId, text, note, new Date(), completed);

      const listOfTodoIds = Wire.data(DataKeys.LIST_OF_IDS).value;
      const listOfVisibleTodoIds = Wire.data(DataKeys.LIST_OF_IDS_VISIBLE).value;
      const currentCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value;
      const currentFilter = Wire.data(DataKeys.FILTER).value;

      const notCompletedCount = currentCount + (completed ? 0 : 1);

      listOfTodoIds.push(newTodoVO.id);
      if (currentFilter !== FilterValues.COMPLETED) {
        listOfVisibleTodoIds.push(newTodoVO.id);
      }

      console.log(`> TodoInputCommand -> execute: currentCount = ${currentCount}`);
      console.log(`> TodoInputCommand -> execute: listOfTodoIds.length = ${listOfTodoIds}`);

      // Add object to data layer by id
      Wire.data(newTodoVO.id, newTodoVO);
      // Update TodoList in data layer
      Wire.data(DataKeys.LIST_OF_IDS, listOfTodoIds);
      // Update TodoList in data layer
      Wire.data(DataKeys.LIST_OF_IDS_VISIBLE, listOfVisibleTodoIds);
      // Update counter
      Wire.data(DataKeys.NOT_COMPLETED_COUNT, notCompletedCount);
      // Reset complete all if it was enabled
      if (Wire.data(DataKeys.COMPLETE_ALL).value) {
        Wire.data(DataKeys.COMPLETE_ALL, false);
      }
    } else {
      // Signalise about error or wrong input
    }
    return isNotEmpty;
  }
}

export default TodoInputCommand;
