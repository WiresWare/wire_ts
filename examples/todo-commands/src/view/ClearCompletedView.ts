import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import DataKeys from '@/consts/DataKeys';

import DomElement from '@/view/base/DomElement';

class ClearCompletedView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const listOfTodoIdsWD = Wire.data(DataKeys.LIST_OF_IDS);
    const notCompletedCountWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const updateComponentVisibility = () =>
      this.setComponentVisibilityFrom(listOfTodoIdsWD.value?.length, notCompletedCountWD.value);
    notCompletedCountWD.subscribe(updateComponentVisibility);
    this.dom.onclick = () => Wire.send(ViewSignals.CLEAR_COMPLETED);
    updateComponentVisibility().then();

    console.log('> ClearCompletedView -> initialized');
  }

  async setComponentVisibilityFrom(numberOfTodos: number, notCompletedCount: number) {
    console.log(`> ClearCompletedView -> setComponentVisibilityFrom: ${numberOfTodos} - ${notCompletedCount}`);
    this.dom.style.display = notCompletedCount >= numberOfTodos ? 'none' : 'block';
  }
}

export default ClearCompletedView;
