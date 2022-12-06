import { Wire } from 'cores.wire';

import CounterSignals from '@/constants/CounterSignals';
import CounterDataKeys from '@/constants/CounterDataKeys';

import WebDatabaseService from '@/service/WebDatabaseService';

import CounterController from '@/app/counter/controller/CounterController';
import CounterView from '@/app/counter/view/CounterView';
import CounterButton from '@/app/counter/view/CounterButton';
import CounterMiddleware from '@/middleware/CounterMiddleware';
import type { IWireDatabaseService } from 'cores.wire';

const $ = document.getElementById.bind(document);

async function main() {
  const dbService: IWireDatabaseService = new WebDatabaseService();
  const initialCountValue = parseInt(await dbService.retrieve(CounterDataKeys.COUNT)) || 0;

  console.log('> initialCountValue', initialCountValue);

  Wire.data(CounterDataKeys.COUNT, initialCountValue);
  Wire.middleware(new CounterMiddleware(dbService));

  new CounterController();

  new CounterView($('ctrCounter')! as HTMLElement);
  new CounterButton($('btnIncrease')!, CounterSignals.INCREASE);
  new CounterButton($('btnDecrease')!, CounterSignals.DECREASE);
}

main().then(() => {
  console.log('APPLICATION READY!');
});
