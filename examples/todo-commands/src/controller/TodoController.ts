import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import GetterKeys from '@/consts/GetterKeys';

import TodoInputCommand from '@/controller/commands/todo/TodoInputCommand';
import TodoToggleCommand from '@/controller/commands/todo/TodoToggleCommand';
import TodoEditCommand from '@/controller/commands/todo/TodoEditCommand';

import TodoDeleteCommand from '@/controller/commands/todo/TodoDeleteCommand';
import CompleteAllTodosCommand from '@/controller/commands/operations/CompleteAllTodosCommand';
import ClearCompletedTodosCommand from '@/controller/commands/operations/ClearCompletedTodosCommand';
import FilterTodosCommand from '@/controller/commands/operations/FilterTodosCommand';
import CountCompletedGetter from '@/controller/getters/CountCompletedGetter';
import DataKeys from '@/consts/DataKeys';
import FilterValues from '@/consts/FilterValues';

class TodoController {
  constructor() {
    Wire.addMany(
      this,
      new Map(
        Object.entries({
          [ViewSignals.INPUT]: (inputDTO) =>
            new TodoInputCommand(inputDTO).execute().then(async (isNotEmpty) => {
              if (isNotEmpty) await Wire.send(ViewSignals.CLEAR_INPUT);
            }),
          [ViewSignals.TOGGLE]: (id) =>
            new TodoToggleCommand(id).execute().then(async (isCompleted) => {
              const filter = Wire.data(DataKeys.FILTER).value;
              if (FilterValues.shouldFilter(isCompleted, filter)) {
                return new FilterTodosCommand(filter).execute();
              }
            }),
          [ViewSignals.EDIT]: (editDTO) =>
            new TodoEditCommand(editDTO).execute().then((isEmpty) => {
              if (isEmpty) new TodoDeleteCommand(editDTO.id).execute();
            }),
          [ViewSignals.DELETE]: (id) => new TodoDeleteCommand(id).execute(),
          [ViewSignals.COMPLETE_ALL]: (isComplete) => new CompleteAllTodosCommand(isComplete).execute(),
          [ViewSignals.CLEAR_COMPLETED]: () => new ClearCompletedTodosCommand().execute(),
          [ViewSignals.FILTER]: (filter) => new FilterTodosCommand(filter).execute(),
        }),
      ),
    ).then(() => {
      console.log('> TodoController -> READY!');
    });
    console.log('> TodoController -> Prepare getters');
    Wire.data(GetterKeys.COUNT_COMPLETED, null, new CountCompletedGetter().getter);
    console.log('> TodoController -> initialized');
  }
}

export default TodoController;
