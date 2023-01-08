import DomElement from '@/components/base/DomElement';
import { Wire } from 'cores.wire';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterView extends DomElement {
  constructor(component: HTMLElement) {
    super(component);
    console.log('> CounterView -> constructor', { component });
    const counter = Wire.data(CounterDataKeys.COUNT);
    counter.subscribe(async (value: number) => {
      this.render(value);
    });
    this.render(counter.value);
  }

  render(count: number) {
    console.log('> CounterView -> render:', { count });
    this.dom.innerHTML = `${count}`;
  }
}

export default CounterView;
