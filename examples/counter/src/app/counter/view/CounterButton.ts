import DomElement from '@/components/base/DomElement';
import { Wire } from 'cores.wire';

class CounterButton extends DomElement {
  constructor(component: HTMLElement, signal: string) {
    super(component);
    console.log('> CounterButton -> constructor', { component });
    component.onclick = async () => {
      this.button.disabled = true;
      await Wire.send(signal);
      this.button.disabled = false;
    };
  }
  get button(): HTMLButtonElement {
    return this.dom as HTMLButtonElement;
  }
}

export default CounterButton;
