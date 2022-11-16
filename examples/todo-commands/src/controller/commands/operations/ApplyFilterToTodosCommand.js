import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';
import FilterValues from '@/consts/FilterValues';

class ApplyFilterToTodosCommand extends WireCommand {
  constructor(filter) {
    super();
    this.filter = filter;
  }

  async execute() {
    const list = Wire.data(DataKeys.LIST_OF_IDS).value;
    console.log(`> ApplyFilterToTodosCommand -> filtered: ${this.filter}`);
    for (let todoId of list) {
      const todoWD = Wire.data(todoId);
      const todoVO = todoWD.value;
      let todoVisible = false;
      switch (this.filter) {
        case FilterValues.ALL:
          todoVisible = true;
          break;
        case FilterValues.ACTIVE:
          todoVisible = !todoVO.completed;
          break;
        case FilterValues.COMPLETED:
          todoVisible = todoVO.completed;
          break;
      }
      if (todoVO.visible !== todoVisible) {
        todoVO.visible = todoVisible;
        Wire.data(todoId, todoVO);
      }
    }
    Wire.data(DataKeys.FILTER, this.filter);
  }
}

export default ApplyFilterToTodosCommand;
