import { Wire } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';

import DomElement from '@/view/base/DomElement';

const SELECTED_CLASS = 'selected';

class TodoFilterView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const filterWD = Wire.data(DataKeys.FILTER);
    filterWD.subscribe((value) => this.processFilter(value));
    this.processFilter(filterWD.value).then();
    console.log('> TodoFilterView -> initialized');
  }

  async processFilter(filter: number) {
    if (filter == null) return;

    console.log(`> TodoFilterView -> DataKeys.FILTER subscribe: ${filter}`);
    (this.dom as HTMLElement).querySelector(`.${SELECTED_CLASS}`)!.className = '';
    this.dom.children[filter].children[0].className = SELECTED_CLASS;
  }
}

export default TodoFilterView;
