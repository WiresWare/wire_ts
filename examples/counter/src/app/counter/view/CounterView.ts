import DomElement from '@/components/base/DomElement';
import { Wire } from 'cores.wire';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterView extends DomElement {
  constructor(component: HTMLElement) {
    super(component);
    console.log('> CounterView -> constructor', { component });
    const count = Wire.data(CounterDataKeys.COUNT);
    count.subscribe(async (value: number) => {
      this.render(value);
    });
    this.render(count.value);
  }

  render(count: number) {
    console.log('> CounterView -> render:', { count });
    this.dom.innerHTML = `${count}`;
  }
}

export default CounterView;
