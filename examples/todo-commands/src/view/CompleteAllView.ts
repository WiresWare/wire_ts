import { Wire } from 'cores.wire';
import { IWireData } from 'cores.wire/dist/interfaces';

import DataKeys from '@/constants/DataKeys';
import ViewSignals from '@/constants/ViewSignals';

import DomElement from './base/DomElement';

class CompleteAllView extends DomElement {
  get checkbox(): HTMLInputElement {
    return this.dom as HTMLInputElement;
  }
  constructor(dom: HTMLElement) {
    super(dom);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT) as IWireData;
    const update = async () => this.setChecked(countWD.value === 0);
    countWD.subscribe(update);
    this.dom.onchange = () => this._onCheckerChange();
    update().then();
    console.log('> CompleteAllView -> initialized');
  }
  _onCheckerChange() {
    const isChecked = this.checkbox.checked;
    console.log(`> CompleteAllView -> _onCheckerChange: ${isChecked}`);
    Wire.send(ViewSignals.COMPLETE_ALL, isChecked).then();
  }
  setChecked(data: boolean | null) {
    console.log(`> CompleteAllView -> _onWireSignalForced: checked = ${data}`);
    this.checkbox.checked = !!data;
  }
}

export default CompleteAllView;
