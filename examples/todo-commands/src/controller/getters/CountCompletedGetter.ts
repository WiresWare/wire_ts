import { Wire } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';

const listOfAllTodosWireData = Wire.data(DataKeys.LIST_OF_IDS);
const notCompletedCountWireData = Wire.data(DataKeys.NOT_COMPLETED_COUNT);

class CountCompletedGetter {
  getter() {
    const notCompletedCount = notCompletedCountWireData.value || 0;
    const result = (listOfAllTodosWireData.value || []).length - notCompletedCount;
    console.log('> CountCompletedGetter -> getter', { result });
    return result;
  }
}

export default CountCompletedGetter;
