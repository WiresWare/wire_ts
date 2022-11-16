import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import DataKeys from '@/consts/DataKeys';

import DomElement from '@/view/base/DomElement';

class CompleteAllView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    Wire.add(this, ViewSignals.COMPLETE_ALL_FORCED, this._onWireSignalForced).then();
    this.checkbox.checked = Wire.data(DataKeys.COMPLETE_ALL).value;
    this.dom.onchange = () => {
      const isChecked = this.checkbox.checked;
      console.log(`> CompleteAllView -> onchange: ${isChecked}`);
      Wire.send(ViewSignals.COMPLETE_ALL, isChecked).then();
    };
    console.log('> CompleteAllView -> initialized');
  }

  get checkbox(): HTMLInputElement {
    return this.dom as HTMLInputElement;
  }

  async _onWireSignalForced(data: boolean | null) {
    console.log(`> CompleteAllView -> onWireSignalForced: checked = ${data}`);
    this.checkbox.checked = !!data;
  }
}

export default CompleteAllView;
