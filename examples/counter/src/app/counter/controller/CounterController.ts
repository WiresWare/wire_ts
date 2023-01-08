import { Wire } from 'cores.wire';
import CounterSignals from '@/constants/CounterSignals';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterController {
  constructor() {
    Wire.add(this, CounterSignals.INCREASE, async (payload: any, wireId) => {
      console.log(`> CounterController: INCREASE -> handle: wireId = ${wireId}; payload = ${payload}`);
      Wire.data(CounterDataKeys.COUNT, (value: any): number => {
        const count = value as number;
        return (count ?? 0) + 1;
      });
    });

    Wire.add(this, CounterSignals.DECREASE, (payload: any, wireId) => {
      console.log(`> CounterController: DECREASE -> handle: wireId = ${wireId}; payload = ${payload}`);
      const count = Wire.data(CounterDataKeys.COUNT);
      const currentValue = count.value as number;
      const nextValue = (currentValue ?? 0) > 0 ? currentValue! - 1 : 0;
      Wire.data(CounterDataKeys.COUNT, nextValue);
    });
  }
}

export default CounterController;
