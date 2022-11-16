import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';

class TodoToggleCommand extends WireCommand {
  private readonly todoId: string;
  constructor(todoId: string) {
    super();
    this.todoId = todoId;
  }

  async execute() {
    const todoVO = Wire.data(this.todoId).value;
    console.log(
      `> TodoToggleCommand -> execute: id = ${todoVO.id} - completed = ${todoVO.completed} - text = ${todoVO.text}`,
    );
    if (todoVO) {
      const wasCompleted = todoVO.completed;
      const currentCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value || 0;
      console.log('\t currentCount =', currentCount);
      todoVO.completed = !todoVO.completed;
      const completedCount = currentCount + (todoVO.completed ? -1 : 1);
      console.log('\t completedCount =', completedCount);
      Wire.data(this.todoId, todoVO);
      Wire.data(DataKeys.NOT_COMPLETED_COUNT, completedCount);
      return wasCompleted;
    }
  }
}

export default TodoToggleCommand;
