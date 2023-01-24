import { Wire } from 'wire-ts';
import DataKeys from '@/constants/DataKeys';

const listOfAllTodos = Wire.data(DataKeys.LIST_OF_IDS);
const notCompletedCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT);

class CountCompletedGetter {
  getter(): number {
    const numberOfNotCompleted: number = notCompletedCount.value || 0;
    const numberOfTodos: number = listOfAllTodos.value.length;
    const result: number = numberOfTodos - numberOfNotCompleted;
    console.log('> CountCompletedGetter -> getter', { result, numberOfTodos, numberOfNotCompleted });
    return result;
  }
}

export default CountCompletedGetter;
