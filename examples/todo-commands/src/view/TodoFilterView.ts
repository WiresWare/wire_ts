import { Wire } from 'cores.wire';

import DataKeys from '@/constants/DataKeys';

import DomElement from './base/DomElement';

const SELECTED_CLASS = 'selected';

class TodoFilterView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const filterWD = Wire.data(DataKeys.FILTER);
    const update = async () => this.processFilter(filterWD.value);
    filterWD.subscribe(update);
    update().then();
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
