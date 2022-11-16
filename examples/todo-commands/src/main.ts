import { Wire } from 'cores.wire';

import DataKeys from '@/consts/DataKeys';

import WebDatabaseService from '@/service/WebDatabaseService';
import TodoStorageMiddleware from '@/middleware/TodoStorageMiddleware';

import TodoInputView from '@/view/TodoInputView';
import TodoListView from '@/view/TodoListView';
import TodoCountView from '@/view/TodoCountView';
import CompleteAllView from '@/view/CompleteAllView';
import ClearCompletedView from '@/view/ClearCompletedView';
import TodoFilterView from '@/view/TodoFilterView';

async function main() {
  console.log('Initialize');

  Wire.put(new WebDatabaseService());
  Wire.middleware(await new TodoStorageMiddleware().whenReady);

  console.log('> init: ', Wire.data(DataKeys.LIST_OF_IDS).value);

  new TodoInputView(document.querySelector('.new-todo')!);
  new TodoListView(document.querySelector('.todo-list')!);
  new TodoCountView(document.querySelector('.todo-count')!.firstChild!);
  new CompleteAllView(document.querySelector('.toggle-all')!);
  new TodoFilterView(document.querySelector('.filters')!);
  new ClearCompletedView(document.querySelector('.clear-completed')!);
}

main().then(() => {
  document.querySelector('#loading')?.remove();
});
