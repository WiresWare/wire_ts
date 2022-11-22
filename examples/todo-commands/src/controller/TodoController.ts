import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import GetterKeys from '@/consts/GetterKeys';

import DataKeys from '@/consts/DataKeys';
import FilterValues from '@/consts/FilterValues';

import InputDTO from '@/model/dto/InputDTO';
import EditDTO from '@/model/dto/EditDTO';

import TodoInputCommand from '@/controller/commands/todo/TodoInputCommand';
import TodoToggleCommand from '@/controller/commands/todo/TodoToggleCommand';
import TodoEditCommand from '@/controller/commands/todo/TodoEditCommand';

import TodoDeleteCommand from '@/controller/commands/todo/TodoDeleteCommand';
import CompleteAllTodosCommand from '@/controller/commands/operations/CompleteAllTodosCommand';
import ClearCompletedTodosCommand from '@/controller/commands/operations/ClearCompletedTodosCommand';
import FilterTodosCommand from '@/controller/commands/operations/FilterTodosCommand';
import CountCompletedGetter from '@/controller/getters/CountCompletedGetter';

class TodoController {
  constructor() {
    const eventsToWireListener = {
      [ViewSignals.INPUT]: async (inputDTO: InputDTO) => {
        const isNotEmpty = await new TodoInputCommand(inputDTO).execute();
        if (isNotEmpty) await Wire.send(ViewSignals.CLEAR_INPUT);
      },
      [ViewSignals.TOGGLE]: async (id: string) => {
        const isCompleted = await new TodoToggleCommand(id).execute();
        const filter = Wire.data(DataKeys.FILTER).value;
        if (FilterValues.shouldApplyFilter(isCompleted, filter)) {
          return new FilterTodosCommand(filter).execute();
        }
      },
      [ViewSignals.EDIT]: async (editDTO: EditDTO) => {
        const isEmpty = await new TodoEditCommand(editDTO).execute();
        if (isEmpty) return new TodoDeleteCommand(editDTO.id).execute();
      },
      [ViewSignals.DELETE]: (id: string) => new TodoDeleteCommand(id).execute(),
      [ViewSignals.COMPLETE_ALL]: (isComplete: boolean) => new CompleteAllTodosCommand(isComplete).execute(),
      [ViewSignals.CLEAR_COMPLETED]: () => new ClearCompletedTodosCommand().execute(),
      [ViewSignals.FILTER]: (filter: number) => new FilterTodosCommand(filter).execute(),
    };
    Wire.addMany(this, new Map(Object.entries(eventsToWireListener)));
    console.log('> TodoController -> Prepare getters');
    Wire.data(GetterKeys.COUNT_COMPLETED, null, new CountCompletedGetter().getter);
    console.log('> TodoController -> initialized');
  }
}

export default TodoController;
