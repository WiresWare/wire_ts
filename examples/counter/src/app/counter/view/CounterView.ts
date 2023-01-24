import { Wire } from 'wire-ts';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterView {
  constructor(component: HTMLElement) {
    console.log('> CounterView -> constructor', { component });
    let previous: number;
    const count = Wire.data(CounterDataKeys.COUNT);
    const render = async (count: number) => {
      component.innerHTML = `
        ${count}
        <sup style='font-size: 0.5em; color: lightgrey;'>
          ${previous ?? "-"}
        </sup>
      `;
      previous = count;
    };
    count.subscribe(render);
    render(count.value);
  }
}

export default CounterView;
