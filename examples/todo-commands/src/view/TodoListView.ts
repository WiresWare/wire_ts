import { Wire } from 'wire.cores';

import DataKeys from '@/consts/DataKeys';
import DomElement from '@/view/base/DomElement';
import TodoListItemView from '@/view/TodoListItemView';

class TodoListView extends DomElement {
  constructor(dom: HTMLElement) {
    super(dom);
    const todoListWD = Wire.data(DataKeys.LIST_OF_IDS);
    const todoList = todoListWD.value;

    if (todoList.length > 0) todoList.forEach((id: string) => this.append(id));

    todoListWD.subscribe(async (list) => {
      console.log(`> TodoListView -> list update ${list}`);
      for (const id of list as Array<string>) {
        if (!document.getElementById(id)) {
          this.append(id);
        }
      }
    });
  }

  append(id: string) {
    const viewItem = new TodoListItemView(id);
    console.log(`> TodoListView -> append id = ${id}`, viewItem.dom, this.dom);
    this.dom.insertBefore(viewItem.dom, this.dom.firstChild);
  }
}

export default TodoListView;
