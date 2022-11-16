import { Wire } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';

import DomElement from '@/view/base/DomElement';

class TodoCountView extends DomElement {
  constructor(dom: ChildNode) {
    super(dom as HTMLElement);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const completedCountGetterWD = Wire.data(DataKeys.GET_COUNT_COMPLETED);
    console.log('> TodoCountView -> subscribe to DataKeys.GET_COUNT_COMPLETED');
    countWD.subscribe(async (value: any) => {
      this.updateCount(value as number, completedCountGetterWD.value as number);
    });
    console.log('> TodoCountView -> get value for: DataKeys.GET_COUNT_COMPLETED');
    this.updateCount(countWD.value || 0, completedCountGetterWD.value || 0);
    console.log('> TodoCountView -> initialized');
  }
  updateCount(count: number, completedCount: number) {
    console.log('> TodoCountView -> updateCount', { count, completedCount });
    this.dom.innerText = `${count.toString()} | ${completedCount.toString()}`;
  }
}

export default TodoCountView;
