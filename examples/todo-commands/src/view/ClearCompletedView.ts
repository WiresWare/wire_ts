import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import DataKeys from '@/consts/DataKeys';

import DomElement from '@/view/base/DomElement';

class ClearCompletedView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const listWD = Wire.data(DataKeys.LIST_OF_IDS);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const updateComponentVisibility = () => this.setComponentVisibilityFrom(listWD.value, countWD.value);
    listWD.subscribe(updateComponentVisibility);
    this.dom.onclick = () => Wire.send(ViewSignals.CLEAR_COMPLETED);
    updateComponentVisibility();

    console.log('> ClearCompletedView -> initialized');
  }

  async setComponentVisibilityFrom(list: Array<any>, count: number) {
    console.log(`> ClearCompletedView -> setComponentVisibilityFrom: ${list.length} - ${count}`);
    this.dom.style.display = count >= list.length ? 'none' : 'block';
  }
}

export default ClearCompletedView;
