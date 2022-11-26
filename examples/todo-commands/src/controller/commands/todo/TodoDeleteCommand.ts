import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/constants/DataKeys';

class TodoDeleteCommand extends WireCommand<void> {
  private readonly _todoId: string;
  constructor(todoId: string) {
    super();
    this._todoId = todoId;
  }

  async execute() {
    const todoWD = Wire.data(this._todoId);
    const isTodoCompleted = todoWD.value.completed;
    console.log(`> TodoDeleteCommand -> execute: id = ${this._todoId}`);

    todoWD
      .remove()
      .then(() => {
        const listOfTodoIds: Array<string> = Wire.data(DataKeys.LIST_OF_IDS).value;
        const listOfVisibleTodoIds: Array<string> = Wire.data(DataKeys.LIST_OF_IDS_VISIBLE).value;

        const indexOfTodo = listOfTodoIds.indexOf(this._todoId);
        const indexOfTodoVisible = listOfVisibleTodoIds.indexOf(this._todoId);

        console.log(`> TodoDeleteCommand -> todo removed:`, { indexOfTodoVisible, indexOfTodo });

        if (indexOfTodoVisible > -1) {
          listOfVisibleTodoIds.splice(indexOfTodoVisible, 1);
          console.log(`> \t\t:`, { listOfVisibleTodoIds });
          Wire.data(DataKeys.LIST_OF_IDS_VISIBLE, listOfVisibleTodoIds);
        }

        listOfTodoIds.splice(indexOfTodo, 1);
        Wire.data(DataKeys.LIST_OF_IDS, listOfTodoIds);
      })
      .then(() => {
        const currentUncompleted = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value;
        const numberOfCompleted = currentUncompleted + (isTodoCompleted ? 0 : -1);
        console.log(`> TodoDeleteCommand -> currentUncompleted:`, { currentUncompleted, numberOfCompleted });
        Wire.data(DataKeys.NOT_COMPLETED_COUNT, numberOfCompleted);
      });
  }
}

export default TodoDeleteCommand;
