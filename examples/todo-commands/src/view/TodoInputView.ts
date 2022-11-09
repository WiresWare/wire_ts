import { Wire } from 'cores.wire';

import DomElement from '@/view/base/DomElement';
import ViewSignals from '@/consts/ViewSignals';
import InputDTO from '@/model/dto/InputDTO';

class TodoInputView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    Wire.add(this, ViewSignals.CLEAR_INPUT, async () => {
      (dom as HTMLInputElement).value = '';
    });
    (this.dom as HTMLInputElement).value = '';
    this.dom.onkeyup = async (e) => {
      const isEnterPressed = e.key === 'Enter';
      console.log('> TodoInputView -> onkeyup:', { isEnterPressed });
      if (isEnterPressed) {
        await Wire.send(ViewSignals.INPUT, new InputDTO((this.dom as HTMLInputElement).value, ''));
      }
    };
  }
}

export default TodoInputView;
