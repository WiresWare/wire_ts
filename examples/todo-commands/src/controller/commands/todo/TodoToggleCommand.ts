import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/constants/DataKeys';

class TodoToggleCommand extends WireCommand<boolean> {
  private readonly _todoId: string;
  constructor(todoId: string) {
    super();
    this._todoId = todoId;
  }

  async execute(): Promise<boolean> {
    const todoVO = Wire.data(this._todoId).value;
    console.log(
      `> TodoToggleCommand -> execute: 
        id = ${todoVO.id} - 
        completed = ${todoVO.completed} - 
        text = ${todoVO.text}`,
    );
    const isCompleted = !todoVO.completed;
    const currentCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value || 0;
    const completedCount = currentCount + (isCompleted ? -1 : 1);
    console.log('\t ', { completedCount, currentCount });

    todoVO.completed = isCompleted;
    Wire.data(this._todoId, todoVO);
    Wire.data(DataKeys.NOT_COMPLETED_COUNT, completedCount);

    return isCompleted;
  }
}

export default TodoToggleCommand;
