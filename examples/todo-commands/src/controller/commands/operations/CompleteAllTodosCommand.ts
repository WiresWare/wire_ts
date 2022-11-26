import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/constants/DataKeys';

class CompleteAllTodosCommand extends WireCommand<void> {
  private readonly _isComplete: boolean;
  constructor(isComplete: boolean) {
    super();
    this._isComplete = isComplete;
  }

  async execute() {
    const listOfTodoIds = Wire.data(DataKeys.LIST_OF_IDS).value;
    let notCompletedCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value;
    console.log(
      `> CompleteAllTodosCommand -> execute: 
        isComplete = ${this._isComplete} - 
        notCompletedCount = ${notCompletedCount}`,
    );
    for (const todoId of listOfTodoIds) {
      const todoVO = Wire.data(todoId).value;
      if (todoVO.completed !== this._isComplete) {
        notCompletedCount += this._isComplete ? -1 : 1;
        todoVO.completed = this._isComplete;
        Wire.data(todoId, todoVO);
      }
    }
    Wire.data(DataKeys.NOT_COMPLETED_COUNT, notCompletedCount);
  }
}

export default CompleteAllTodosCommand;
