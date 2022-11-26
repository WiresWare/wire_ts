import { Wire } from 'cores.wire';
import DataKeys from '@/constants/DataKeys';

const listOfAllTodosWireData = Wire.data(DataKeys.LIST_OF_IDS);
const notCompletedCountWireData = Wire.data(DataKeys.NOT_COMPLETED_COUNT);

class CountCompletedGetter {
  getter(): number {
    const notCompletedCount: number = notCompletedCountWireData.value || 0;
    const numberOfTodos: number = listOfAllTodosWireData.value.length;
    const result: number = numberOfTodos - notCompletedCount;
    console.log('> CountCompletedGetter -> getter', { result, numberOfTodos, notCompletedCount });
    return result;
  }
}

export default CountCompletedGetter;
