import { Wire } from 'wire-ts';

import DataKeys from '@/constants/DataKeys';
import GetterKeys from '@/constants/GetterKeys';

import DomElement from './base/DomElement';
import { utilStringTodoCount } from '@/utils/stringUtils';

class TodoCountView extends DomElement {
  constructor(dom: ChildNode) {
    super(dom as HTMLElement);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const update = async () => this.updateCount(countWD.value);
    countWD.subscribe(update);
    update().then();
    console.log('> TodoCountView -> initialized');
  }
  updateCount(count: number) {
    const completedCount: number = Wire.data(GetterKeys.COUNT_COMPLETED).value as number;
    const text = utilStringTodoCount(count, completedCount);
    console.log('> TodoCountView -> updateCount', { count, completedCount });
    this.dom.innerText = text;
  }
}

export default TodoCountView;
