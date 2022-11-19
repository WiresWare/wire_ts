import { Wire } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';
import GetterKeys from '@/consts/GetterKeys';

import DomElement from '@/view/base/DomElement';

class TodoCountView extends DomElement {
  constructor(dom: ChildNode) {
    super(dom as HTMLElement);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    countWD.subscribe(async (value) => this.updateCount(value));
    this.updateCount(countWD.value);
    console.log('> TodoCountView -> initialized');
  }
  updateCount(count: number) {
    const completedCount: number = Wire.data(GetterKeys.COUNT_COMPLETED).value as number;
    console.log('> TodoCountView -> updateCount', { count, completedCount });
    this.dom.innerText = `${count.toString()} | ${completedCount.toString()}`;
  }
}

export default TodoCountView;
