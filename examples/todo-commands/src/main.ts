import { Wire } from 'cores.wire';

import TodoInputView from './view/TodoInputView';
import DataKeys from './consts/DataKeys';
import ViewSignals from './consts/ViewSignals';
import TodoVO from './model/vos/TodoVO';

const todoVO = new TodoVO(`${Date.now()}`, 'Title', '', new Date());
const scope = {};

Wire.data(todoVO.id, todoVO);
Wire.data(DataKeys.LIST_OF_IDS, [todoVO.id]);
Wire.add(scope, ViewSignals.TOGGLE, (payload: any, wid: number) => {
  console.log('> ViewSignals.TOGGLE', payload, wid);
}).then();

new TodoInputView(document.querySelector('.new-todo')!);

document.querySelector('#loading')?.remove();
