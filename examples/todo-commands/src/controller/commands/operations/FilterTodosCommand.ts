import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/constants/DataKeys';
import FilterValues from '@/constants/FilterValues';

class FilterTodosCommand extends WireCommand<void> {
  private readonly _filter: number;
  constructor(filter: number) {
    super();
    this._filter = filter;
  }

  async execute() {
    const listOfTodoIds = Wire.data(DataKeys.LIST_OF_IDS).value;
    console.log(`> ApplyFilterToTodosCommand -> filtered: ${this._filter}`);
    const listOfVisibleTodoIds = [];
    for (const todoId of listOfTodoIds) {
      const todoWD = Wire.data(todoId);
      const todoVO = todoWD.value;
      let todoVisible = false;
      switch (this._filter) {
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
      if (todoVisible) listOfVisibleTodoIds.push(todoVO.id);
    }
    Wire.data(DataKeys.LIST_OF_IDS_VISIBLE, listOfVisibleTodoIds);
    Wire.data(DataKeys.FILTER, this._filter);
  }
}

export default FilterTodosCommand;
