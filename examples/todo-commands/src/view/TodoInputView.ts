import { Wire } from 'wire.cores';

import DomElement from '@/view/base/DomElement';
import ViewSignals from '@/consts/ViewSignals';

class TodoInputView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    Wire.add(this, ViewSignals.CLEAR_INPUT, async () => {
      (dom as HTMLInputElement).value = '';
    });
    this.dom.value = '';
    this.dom.onkeyup = async (e) => {
      if (e.key === 'Enter') {
        await Wire.send(ViewSignals.INPUT, this.dom.value);
      }
    };
  }
  get dom(): HTMLInputElement {
    return super.dom as HTMLInputElement;
  }
}

export default TodoInputView;
