export default class TodoModel {
  constructor() {
    this.todoStorage = [];
    this.completeStorage = [];
  }

  static TODO_KEY = 'MarcoTODO';

  static COMPLETE_KEY = 'MarcoCOMPLETE';

  pushDataToStorage(obj, storage) {
    storage.push(obj);
  }

  saveTodo(key, storage) {
    chrome.storage.sync.set({
      [key]: JSON.stringify(storage),
    });
  }

  setCompleteStorage(data) {
    this.completeStorage = data;
  }

  getRandomNumber() {
    const sameNum = randomNum => {
      const length = this.completeStorage.length;
      for (let i = 0; i < length; i++) {
        if (randomNum === this.completeStorage[i].id) {
          return true;
        }
      }
      return false;
    };
    let i = 0;
    while (i < 1) {
      const randomNum = Math.floor(Math.random() * 10000000);
      if (!sameNum(randomNum)) {
        return randomNum;
        i++;
      }
    }
  }
}
