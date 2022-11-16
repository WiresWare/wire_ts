import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';

class CompleteAllTodosCommand extends WireCommand {
  constructor(isComplete) {
    super();
    this.isComplete = isComplete;
  }

  async execute() {
    const todoIdsList = Wire.data(DataKeys.LIST_OF_IDS).value;
    let count = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value;
    console.log(`> CompleteAllTodosCommand -> execute: isComplete = ${this.isComplete} - count = ${count}`);
    for (let todoId of todoIdsList) {
      const todoVO = Wire.data(todoId).value;
      if (todoVO.completed !== this.isComplete) {
        count += this.isComplete ? -1 : 1;
        todoVO.completed = this.isComplete;
        Wire.data(todoId, todoVO);
      }
    }
    Wire.data(DataKeys.NOT_COMPLETED_COUNT, count);
    Wire.data(DataKeys.COMPLETE_ALL, this.isComplete);
  }
}

export default CompleteAllTodosCommand;
