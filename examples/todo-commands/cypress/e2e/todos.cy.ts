import { utilStringTodoCount } from '@/utils/stringUtils';
import Dom from '@/constants/Dom';
import { slowCypressDown } from '../utils/slowDownCypress';

slowCypressDown(100);

describe('Todos different scenarios', () => {
  const TODO_TEXT = 'Write';

  const getButtonToggleAll = () => cy.get(`#${Dom.TOGGLE_ALL}`);
  const getButtonClearCompleted = () => cy.get(`#${Dom.BUTTON_CLEAR_COMPLETED}`);
  const getTodosContainer = () => cy.get(`#${Dom.TODOS_CONTAINER}`);

  const createTodoWithText = (text: string) =>
    cy.get(`#${Dom.INPUT_TODO}`).should('be.visible').type(`${text}{enter}`).should('have.text', '');

  const backspacesFromText = (text: string) => Array(text.length).fill('{backspace}').join('');

  const deleteTodoFromContainer = () =>
    cy.get(`#${Dom.TODOS_CONTAINER}`).children().get('.destroy').eq(0).invoke('show').click();

  const checkTodosCount = (count: number, completedCount: number) =>
    cy.get(`#${Dom.TODOS_COUNTER}`).should('have.text', utilStringTodoCount(count, completedCount));

  const checkNumberOfShownTodos = (amount: number) =>
    cy.get(`#${Dom.TODOS_CONTAINER}`).children().should('have.length', amount);

  const checkTodoTextAt = (index: number, text: string) =>
    cy.get(`#${Dom.TODOS_CONTAINER}`).children().eq(index).should('have.text', text);

  const editTodoTextAt = (index: number, text: string) =>
    cy
      .get(`#${Dom.TODOS_CONTAINER}`)
      .children()
      .eq(index)
      .dblclick()
      .get('li.editing > .edit')
      .type('{selectAll}{del}')
      .type(`${text}{enter}`)
      .parent()
      .should('have.text', text);

  const toggleTodoAt = (index: number) => cy.get(`#${Dom.TODOS_CONTAINER} > li .toggle`).eq(index).click();
  const clearAllCompleted = () => getButtonClearCompleted().should('be.visible').click().should('not.be.visible');

  const applyFilterAll = () => cy.get(`#${Dom.FILTER_ALL}`).should('not.have.class', 'selected').click();
  const applyFilterActive = () => cy.get(`#${Dom.FILTER_ACTIVE}`).should('not.have.class', 'selected').click();
  const applyFilterCompleted = () => cy.get(`#${Dom.FILTER_COMPLETED}`).should('not.have.class', 'selected').click();

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8089');
    cy.get(`#${Dom.FILTER_ALL} > a`).should('have.class', 'selected');
  });

  it('Create new todo and delete it', () => {
    createTodoWithText(TODO_TEXT);
    checkTodosCount(1, 0);
    getTodosContainer()
      .should('be.visible')
      .and('have.class', 'todo-list')
      .children()
      .should('have.length', 1)
      .eq(0)
      .should('have.text', TODO_TEXT)
      .get('.destroy')
      .should('be.hidden')
      .invoke('show')
      .click();
    checkTodosCount(0, 0);
  });

  it('List of todos, checks counter, then delete them', () => {
    const list = ['1', '2', '3'];
    checkTodosCount(0, 0);
    checkNumberOfShownTodos(0);
    list.forEach(createTodoWithText);
    checkTodosCount(list.length, 0);
    checkNumberOfShownTodos(3);
    cy.reload();
    checkTodosCount(list.length, 0);
    checkNumberOfShownTodos(3);
    list.forEach(deleteTodoFromContainer);
    getTodosContainer().children().should('have.length', 0);
    checkTodosCount(0, 0);
    checkNumberOfShownTodos(0);
  });

  it('Create todo, edit todo, complete, delete', () => {
    const TODO_EDIT_TEXT = 'Code';
    createTodoWithText(TODO_TEXT);
    checkTodosCount(1, 0);
    getButtonClearCompleted().should('not.be.visible');
    getTodosContainer()
      .children()
      .should('have.length', 1)
      .eq(0)
      .should('have.text', TODO_TEXT)
      .dblclick()
      .get('.edit')
      .type(backspacesFromText(TODO_TEXT))
      .type(`${TODO_EDIT_TEXT}{enter}`)
      .parent()
      .should('have.text', TODO_EDIT_TEXT)
      .get('.toggle')
      .should('not.be.checked')
      .click()
      .should('be.checked');
    checkTodosCount(0, 1);
    getButtonClearCompleted().should('be.visible');
    cy.reload();
    checkTodosCount(0, 1);
    checkNumberOfShownTodos(1);
  });

  it('Create list todo, complete few, navigate filters', () => {
    const list = ['1', '2', '3', '4', '5'];
    list.forEach(createTodoWithText);
    getButtonClearCompleted().should('not.be.visible');
    applyFilterActive();
    checkTodosCount(list.length, 0);
    checkNumberOfShownTodos(list.length);
    applyFilterCompleted();
    checkNumberOfShownTodos(0);
    applyFilterActive();
    toggleTodoAt(0);
    checkNumberOfShownTodos(list.length - 1);
    checkTodosCount(list.length - 1, 1);
    applyFilterCompleted();
    checkNumberOfShownTodos(1);
    checkTodoTextAt(0, list[list.length - 1]);
    applyFilterAll();
    checkNumberOfShownTodos(list.length);
    getButtonClearCompleted().should('be.visible').click().should('not.be.visible');
    checkNumberOfShownTodos(list.length - 1);
    checkTodosCount(list.length - 1, 0);
    applyFilterCompleted();
    createTodoWithText(`${list.length}`);
    checkNumberOfShownTodos(0);
    checkTodosCount(list.length, 0);
    applyFilterAll();
    checkNumberOfShownTodos(list.length);
    toggleTodoAt(list.length - 1);
    toggleTodoAt(0);
    checkTodosCount(list.length - 2, 2);
    applyFilterCompleted();
    checkTodoTextAt(0, list[list.length - 1]);
    editTodoTextAt(0, 'Another text');
    checkTodoTextAt(1, list[0]);
    editTodoTextAt(1, 'Changed');
    applyFilterAll();
    checkNumberOfShownTodos(list.length);
    clearAllCompleted();
  });

  it('Complete all, navigate filters', () => {
    const list = ['1', '2', '3'];
    list.forEach(createTodoWithText);
    checkNumberOfShownTodos(list.length);
    checkTodosCount(list.length, 0);
    getButtonToggleAll().click().should('be.checked');
    checkTodosCount(0, list.length);
    toggleTodoAt(0);
    checkTodosCount(1, list.length - 1);
    getButtonToggleAll().should('not.be.checked').click();
    checkTodosCount(0, list.length);
    getButtonToggleAll().click();
    checkTodosCount(list.length, 0);
    list.forEach(deleteTodoFromContainer);
  });
});

export {};
