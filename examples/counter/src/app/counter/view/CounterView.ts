import DomElement from '@/components/base/DomElement';
import { Wire } from 'cores.wire';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterView extends DomElement {
  constructor(component: HTMLElement) {
    super(component);
    console.log('> CounterView -> constructor', { component });
    const counterWireData = Wire.data(CounterDataKeys.COUNT);
    counterWireData.subscribe(async (value: number) => this.render(value));
    this.render(counterWireData.value);
  }

  render(count: number) {
    console.log('> CounterView -> render:', { count });
    this.dom.innerHTML = `${count}`;
  }
}

export default CounterView;
