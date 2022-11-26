import { Wire } from 'cores.wire';

import DomElement from './base/DomElement';
import ViewSignals from '@/constants/ViewSignals';
import InputDTO from '@/model/data/dto/InputDTO';

class TodoInputView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    Wire.add(this, ViewSignals.CLEAR_INPUT, async () => {
      (dom as HTMLInputElement).value = '';
    });
    (this.dom as HTMLInputElement).value = '';
    this.dom.onkeyup = async (e) => {
      const isEnterPressed = e.key === 'Enter';
      if (isEnterPressed) {
        console.log('> TodoInputView -> onkeyup:', { isEnterPressed });
        const text = (this.dom as HTMLInputElement).value;
        const payload = new InputDTO(text, '');
        await Wire.send(ViewSignals.INPUT, payload);
      }
    };
    console.log('> TodoInputView -> initialized');
  }
}

export default TodoInputView;
