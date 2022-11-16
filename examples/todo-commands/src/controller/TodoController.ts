import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';

import TodoInputCommand from '@/controller/commands/todo/TodoInputCommand';
import TodoToggleCommand from '@/controller/commands/todo/TodoToggleCommand';
import CheckAllCompletedCommand from '@/controller/commands/operations/CheckAllCompletedCommand';

class TodoController {
  constructor() {
    Wire.addMany(
      this,
      new Map(
        Object.entries({
          [ViewSignals.INPUT]: (inputDTO) => new TodoInputCommand(inputDTO).execute(),
          [ViewSignals.TOGGLE]: (id) =>
            new TodoToggleCommand(id)
              .execute()
              .then((wasCompleted) => (wasCompleted ? new CheckAllCompletedCommand().execute() : Promise.resolve())),
          // [ViewSignals.EDIT]: (editDTO) => new TodoEditCommand(editDTO).execute(),
          // [ViewSignals.DELETE]: (id) => new TodoDeleteCommand(id).execute(),
          // [ViewSignals.COMPLETE_ALL]: (isComplete) => new CompleteAllTodosCommand(isComplete).execute(),
          // [ViewSignals.CLEAR_COMPLETED]: () => new ClearCompletedTodosCommand().execute(),
          // [ViewSignals.FILTER]: (filter) => new ApplyFilterToTodosCommand(filter).execute(),
        }),
      ),
    ).then(() => {
      console.log('> TodoController -> READY!');
    });
    console.log('> TodoController -> Prepare getters');
    // Wire.data(DataKeys.GET_COUNT_COMPLETED, null, new CountCompletedGetter().getter);
  }
}

export default TodoController;
