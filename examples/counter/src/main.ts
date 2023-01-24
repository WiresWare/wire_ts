import { Wire } from 'wire-ts';

import CounterSignals from '@/constants/CounterSignals';
import CounterDataKeys from '@/constants/CounterDataKeys';

import WebDatabaseService from '@/service/WebDatabaseService';

import CounterController from '@/app/counter/controller/CounterController';
import CounterView from '@/app/counter/view/CounterView';
import CounterButton from '@/app/counter/view/CounterButton';
import CounterMiddleware from '@/middleware/CounterMiddleware';
import type { IWireDatabaseService } from 'wire-ts';

const $ = document.getElementById.bind(document);

async function main() {
  const dbService: IWireDatabaseService = new WebDatabaseService();
  const counterValueRaw = await dbService.retrieve(CounterDataKeys.COUNT);
  const initialCountValue = parseInt(counterValueRaw) || 0;

  console.log('> initialCountValue', initialCountValue);

  Wire.data(CounterDataKeys.COUNT, initialCountValue);
  Wire.middleware(new CounterMiddleware(dbService));

  new CounterController();

  new CounterView($('viewCounter')! as HTMLElement);
  new CounterButton($('btnIncrease')! as HTMLButtonElement, CounterSignals.INCREASE);
  new CounterButton($('btnDecrease')! as HTMLButtonElement, CounterSignals.DECREASE);
}

main().then(() => {
  console.log('APPLICATION READY!');
  document.querySelector('#loading')?.remove();
});
