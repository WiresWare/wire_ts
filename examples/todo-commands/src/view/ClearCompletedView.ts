import { Wire } from 'cores.wire';

import ViewSignals from '@/constants/ViewSignals';
import DataKeys from '@/constants/DataKeys';

import DomElement from './base/DomElement';
import FilterValues from '@/constants/FilterValues';

class ClearCompletedView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const listWD = Wire.data(DataKeys.LIST_OF_IDS);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const filterWD = Wire.data(DataKeys.FILTER);

    const update = async () =>
      this.setVisibility(countWD.value < listWD.value?.length && filterWD.value !== FilterValues.ACTIVE);

    filterWD.subscribe(update);
    countWD.subscribe(update);

    update().then();
    this.dom.onclick = () => Wire.send(ViewSignals.CLEAR_COMPLETED);

    console.log('> ClearCompletedView -> initialized');
  }

  setVisibility(isVisible: boolean) {
    console.log(`> ClearCompletedView -> setComponentVisibilityFrom: ${isVisible}`);
    this.dom.style.display = isVisible ? 'block' : 'none';
  }
}

export default ClearCompletedView;
