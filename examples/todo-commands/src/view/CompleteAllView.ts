import { Wire } from 'cores.wire';
import { IWireData } from 'cores.wire/dist/interfaces';

import DataKeys from '@/consts/DataKeys';
import ViewSignals from '@/consts/ViewSignals';

import DomElement from '@/view/base/DomElement';

class CompleteAllView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const countWD: IWireData = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    countWD.subscribe(async (value: number) => this._onWireSignalForced(value === 0));
    this.dom.onchange = () => {
      const isChecked = this.checkbox.checked;
      console.log(`> CompleteAllView -> onchange: ${isChecked}`);
      Wire.send(ViewSignals.COMPLETE_ALL, isChecked).then();
    };
    this._onWireSignalForced(countWD.value === 0);
    console.log('> CompleteAllView -> initialized');
  }

  get checkbox(): HTMLInputElement {
    return this.dom as HTMLInputElement;
  }

  _onWireSignalForced(data: boolean | null) {
    console.log(`> CompleteAllView -> onWireSignalForced: checked = ${data}`);
    this.checkbox.checked = !!data;
  }
}

export default CompleteAllView;
