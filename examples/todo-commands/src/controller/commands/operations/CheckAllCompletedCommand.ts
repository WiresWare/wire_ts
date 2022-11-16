import { Wire, WireCommand } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';
import ViewSignals from '@/consts/ViewSignals';

class CheckAllCompletedCommand extends WireCommand {
  async execute() {
    const completeAllWD = Wire.data(DataKeys.COMPLETE_ALL);
    const completeAll = completeAllWD.isSet && completeAllWD.value;
    console.log(`> CheckAllCompletedCommand: completeAll = ${completeAll}`);
    Wire.data(DataKeys.COMPLETE_ALL, completeAll);
    if (completeAll) {
      await Wire.send(ViewSignals.COMPLETE_ALL_FORCED, false);
    }
  }
}

export default CheckAllCompletedCommand;
