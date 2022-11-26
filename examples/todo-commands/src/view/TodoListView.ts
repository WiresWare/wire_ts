import { Wire } from 'cores.wire';

import DataKeys from '@/constants/DataKeys';
import DomElement from './base/DomElement';
import TodoListItemView from './TodoListItemView';

class TodoListView extends DomElement {
  private listOfVisibleTodoIds: Array<string>;

  constructor(dom: HTMLElement) {
    super(dom);
    const listOfVisibleTodoIdsWD = Wire.data(DataKeys.LIST_OF_IDS_VISIBLE);
    this.listOfVisibleTodoIds = listOfVisibleTodoIdsWD.value;
    listOfVisibleTodoIdsWD.subscribe(async (list) => this.onListUpdated(list));
    console.log(`> TodoListView -> initialized with ${this.listOfVisibleTodoIds.length} items`);
    this.renderList();
  }
  onListUpdated(listOfTodoIds: Array<string>) {
    const isNewList = this.listOfVisibleTodoIds != listOfTodoIds;
    console.log(`> TodoListView -> onListUpdated:`, { isNewList, listOfTodoIds });
    if (isNewList) this.resetListTo(listOfTodoIds);
    this.renderList();
  }
  resetListTo(newList: Array<string>) {
    this.dom.innerHTML = '';
    this.listOfVisibleTodoIds = newList;
  }
  renderList() {
    for (const id of this.listOfVisibleTodoIds) {
      if (!this.dom.querySelector(`#${id}`)) {
        this.append(id);
      }
    }
  }
  append(id: string) {
    const viewItem = new TodoListItemView(id);
    console.log(`> TodoListView -> append id = ${id}`, viewItem.dom, this.dom);
    this.dom.insertBefore(viewItem.dom, this.dom.firstChild);
  }
}

export default TodoListView;
