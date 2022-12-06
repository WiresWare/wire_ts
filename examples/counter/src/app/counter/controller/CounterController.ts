import { Wire } from 'cores.wire';
import CounterSignals from '@/constants/CounterSignals';
import CounterDataKeys from '@/constants/CounterDataKeys';

class CounterController {
  constructor() {
    Wire.add(this, CounterSignals.INCREASE, (payload: any, wireId) => {
      console.log(`> CounterController: INCREASE -> handle: wireId = ${wireId}; payload = ${payload}`);
      Wire.data(CounterDataKeys.COUNT, (value: any): number => {
        const count = value as number;
        return (count ?? 0) + 1;
      });
    });

    Wire.add(this, CounterSignals.DECREASE, (payload: any, wireId) => {
      console.log(`> CounterController: DECREASE -> handle: wireId = ${wireId}; payload = ${payload}`);
      const countWireData = Wire.data(CounterDataKeys.COUNT);
      const count = countWireData.value as number;
      const nextCount = (count ?? 0) > 0 ? count! - 1 : 0;
      Wire.data(CounterDataKeys.COUNT, nextCount);
    });
  }
}

export default CounterController;
