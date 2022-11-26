import { Wire, WireCommand } from 'cores.wire';

import DataKeys from '@/constants/DataKeys';

class ClearCompletedTodosCommand extends WireCommand<void> {
  async execute() {
    const listOfTodoIds = Wire.data(DataKeys.LIST_OF_IDS).value;
    const listOfVisibleTodoIds = Wire.data(DataKeys.LIST_OF_IDS_VISIBLE).value;
    const filteredIdsList = listOfTodoIds.filter((id: string) => {
      const todoWD = Wire.data(id);
      const isCompleted = todoWD.value.completed;
      if (isCompleted) {
        todoWD.remove(true);
        const indexOfInVisible = listOfVisibleTodoIds.indexOf(id);
        if (indexOfInVisible > -1) {
          listOfVisibleTodoIds.splice(indexOfInVisible, 1);
        }
      }
      return !isCompleted;
    });
    console.log(`> ClearCompletedTodosCommand -> execute: ${filteredIdsList.length}:`, filteredIdsList);
    Wire.data(DataKeys.LIST_OF_IDS, filteredIdsList);
    Wire.data(DataKeys.LIST_OF_IDS_VISIBLE, listOfVisibleTodoIds);
    Wire.data(DataKeys.NOT_COMPLETED_COUNT, filteredIdsList.length);
  }
}

export default ClearCompletedTodosCommand;
