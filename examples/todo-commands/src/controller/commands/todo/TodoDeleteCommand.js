import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';

class TodoDeleteCommand extends WireCommand {
  constructor(todoId) {
    super();
    this.todoId = todoId;
  }

  async execute() {
    const todoDW = Wire.data(this.todoId);
    console.log(`> TodoDeleteCommand -> execute: id = ${this.todoId}`);
    if (todoDW.value.completed === false) {
      const currentUncompleted = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value;
      Wire.data(DataKeys.NOT_COMPLETED_COUNT, currentUncompleted - 1);
    }
    todoDW.remove().then(() => {
      const listOfTodos = Wire.data(DataKeys.LIST_OF_IDS).value;
      const indexOfTodo = listOfTodos.indexOf(this.todoId);
      listOfTodos.splice(indexOfTodo, 1);
      Wire.data(DataKeys.LIST_OF_IDS, listOfTodos);
    });
  }
}

export default TodoDeleteCommand;
