import { Wire } from 'cores.wire';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterView {
  constructor(component: HTMLElement) {
    console.log('> CounterView -> constructor', { component });
    const count = Wire.data(CounterDataKeys.COUNT);
    const render = async (count: number) => {
      component.innerHTML = `${count}`;
    };
    count.subscribe(render);
    render(count.value);
  }
}

export default CounterView;
