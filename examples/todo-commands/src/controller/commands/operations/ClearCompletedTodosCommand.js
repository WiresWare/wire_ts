import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';
import CheckAllCompletedCommand from '@/mvc/controller/commands/operations/CheckAllCompletedCommand';

class ClearCompletedTodosCommand extends WireCommand {
  async execute() {
    const todoIdsList = Wire.data(DataKeys.LIST_OF_IDS).value;
    const filteredList = todoIdsList.filter((id) => {
      const todoWD = Wire.data(id);
      const isCompleted = todoWD.value.completed;
      if (isCompleted) todoWD.remove(true);
      return !isCompleted;
    });
    console.log(`> ClearCompletedTodosCommand -> execute: ${filteredList.length}:`, filteredList);
    Wire.data(DataKeys.LIST_OF_IDS, filteredList);
    Wire.data(DataKeys.NOT_COMPLETED_COUNT, filteredList.length);
    await new CheckAllCompletedCommand().execute();
  }
}

export default ClearCompletedTodosCommand;
