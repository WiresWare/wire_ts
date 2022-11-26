import { Wire } from 'cores.wire';
import { IWireData } from 'cores.wire/dist/interfaces';
import { WireDataListener } from 'cores.wire/dist/types';

import DomElement from './base/DomElement';
import ViewSignals from '@/constants/ViewSignals';
import TodoVO from '@/model/data/vos/TodoVO';
import EditDTO from '@/model/data/dto/EditDTO';

const createWithClass = (tag: string, className: string) => {
  const result = document.createElement(tag);
  result.className = className;
  return result;
};

class TodoListItemView extends DomElement {
  private readonly lblContent: HTMLLabelElement;
  private readonly btnDelete: HTMLButtonElement;
  private readonly inpEdit: HTMLInputElement;
  private readonly inpToggle: HTMLInputElement;
  private readonly container: HTMLDivElement;

  private readonly wireDataListener: WireDataListener;

  constructor(id: string) {
    super(document.createElement('li'));
    this.dom.id = id;

    this.lblContent = createWithClass('label', 'todo-content') as HTMLLabelElement;
    this.btnDelete = createWithClass('button', 'destroy') as HTMLButtonElement;
    this.inpEdit = createWithClass('input', 'edit') as HTMLInputElement;
    this.inpToggle = createWithClass('input', 'toggle') as HTMLInputElement;
    this.inpToggle.type = 'checkbox';
    this.container = createWithClass('div', 'view') as HTMLDivElement;

    this.container.append(this.inpToggle);
    this.container.append(this.lblContent);
    this.container.append(this.btnDelete);

    /*
    <div class="view">
      <input class="toggle"/>
      <label class="todo-content"></label>
      <input class="edit"/>
      <button class="destroy"/>
    </div>
    * */

    this.dom.append(this.inpEdit);
    this.dom.append(this.container);

    this.dom.addEventListener('DOMNodeRemoved', (e) => this._onDomRemoved(e));
    this.inpToggle.onclick = () => Wire.send(ViewSignals.TOGGLE, id);
    this.btnDelete.onclick = () => Wire.send(ViewSignals.DELETE, id);
    this.inpEdit.onkeydown = (e) => this._onInputEditKeyboardKey(e.key);
    this.lblContent.ondblclick = () => this._OnEditBegin();
    this.inpEdit.onblur = () => this._OnEditCancel();

    this.wireDataListener = async (todoVO) => this._OnWireDataValueChanged(todoVO);

    const todoWD = Wire.data(id) as IWireData;
    todoWD.subscribe(this.wireDataListener);

    console.log(`> TodoListItemView(${id}) -> isSet = ${todoWD.isSet}`);
    this._OnWireDataValueChanged(todoWD.value);
  }
  updateDom({ completed, text }: TodoVO) {
    console.log(`> TodoListItemView(${this.dom.id}) -> updateDom`, { text, completed });
    this.dom.className = completed ? 'completed' : '';
    this.inpToggle.checked = completed;
    this.lblContent.innerText = text;
    this.inpEdit.value = text;
    this.inpEdit.selectionStart = text.length;
  }
  cleanup() {
    const todoWD = Wire.data(this.dom.id);
    const hasWireDataListener = todoWD.hasListener(this.wireDataListener);
    console.log(`> TodoListItemView(${this.dom.id}) -> cleanup`, { hasWireDataListener });
    todoWD.unsubscribe(this.wireDataListener);
    this.inpToggle.onclick = null;
    this.btnDelete.onclick = null;
    this.inpEdit.onkeydown = null;
    this.lblContent.ondblclick = null;
    this.inpEdit.onblur = null;
    this.dom.removeEventListener('DOMNodeRemoved', this._onDomRemoved);
  }
  removeDom() {
    console.log(`> TodoListItemView(${this.dom.id}) -> removeDom`);
    this.dom.remove();
  }
  _onDomRemoved(e: any) {
    const isDomRemoved = e.target === this.dom;
    console.log(`> TodoListItemView(${this.dom.id}) -> _onDomRemoved`, { isDomRemoved, e });
    if (isDomRemoved) this.cleanup();
  }
  _onInputEditKeyboardKey(key: string) {
    // console.log('> TodoListItemView -> _onInputEditKeyboardKey:', { key });
    if (key === 'Enter') {
      const editValue = this.inpEdit.value.trim();
      const editData = new EditDTO(this.dom.id, editValue, '');
      console.log('> TodoListItemView -> _onInputEditKeyboardKey:', { editValue });
      (this.inpEdit as HTMLInputElement).disabled = true;
      Wire.send(ViewSignals.EDIT, editData).then(() => {
        (this.inpEdit as HTMLInputElement).disabled = false;
        this._OnEditCancel();
      });
    } else if (key === 'Escape') this._OnEditCancel();
  }
  _OnWireDataValueChanged(todoVO: TodoVO) {
    const isEmpty = todoVO == null;
    console.log(`> TodoListItemView -> _OnTodoDataChanged: id = ${this.dom.id}, isEmpty = ${isEmpty}`);
    if (isEmpty) {
      this.removeDom();
    } else {
      this.updateDom(todoVO);
    }
  }
  _OnEditBegin() {
    this.dom.classList.add('editing');
    this.inpEdit.focus();
  }
  _OnEditCancel() {
    this.inpEdit.value = this.lblContent.innerText;
    this.dom.classList.remove('editing');
  }
}

export default TodoListItemView;
