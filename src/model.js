export default class TodoModel {
  constructor() {
    this.inputTodoData;
    this.todoStorage = [];
    this.completeStorage = [];
  }

  static TODO_KEY = 'MarcoTODO';

  static COMPLETE_KEY = 'MarcoCOMPLETE';

  getTodoDataFromUser() {
    return this.inputTodoData;
  }

  setTodoDataFromUser(data) {
    this.inputTodoData = data;
  }

  pushDataToStorage(obj, storage) {
    storage.push(obj);
  }

  saveTodo(key, storage) {
    // localStorage.setItem(key, JSON.stringify(storage));
    chrome.storage.sync.set({
      [key]: JSON.stringify(storage),
    });
  }

  setTodoStorage(data) {
    this.todoStorage = data;
  }
  setCompleteStorage(data) {
    this.completeStorage = data;
  }
}
