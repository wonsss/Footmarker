// eslint-disable-next-line import/extensions
// eslint-disable-next-line class-methods-use-this
import TodoModel from './model.js';

export default class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.alreadyShow = false;
    this.searchResultShow = false;
  }

  init() {
    this.changeDivOrder();
    this.initAchievement();
    this.initSearchForm();

    const setComplete = data => {
      this.model.setCompleteStorage(data);
      this.model.completeStorage.forEach(this.createCompleteHandler.bind(this));
    };
    chrome.storage.sync.get(function (data) {
      if (data.MarcoCOMPLETE !== null) {
        const parsedData = JSON.parse(data.MarcoCOMPLETE);
        setComplete(parsedData);
      }
    });

    const getHeading = i => {
      return `document.querySelectorAll('h1,h2,h3,h4').item(${i}).innerHTML;`;
    };
    const getAll = i => {
      chrome.tabs.executeScript(
        {
          code: getHeading(i),
        },
        data => {
          const now = new Date();
          const month = now.getMonth() + 1;
          const date = now.getDate();
          const hour = TodoController.prototype.beautifyTime(now.getHours());
          const minute = TodoController.prototype.beautifyTime(
            now.getMinutes()
          );
          // if (!data[0].includes('</a>')) {
          //   return false;
          // }
          chrome.tabs.executeScript(
            {
              code: 'document.location.href',
            },
            url => {
              let simpleUrl = '';
              function isHashThere() {
                const indexStart = data[0].indexOf('href="#') + 6;
                const indexEnd = data[0].indexOf('"', indexStart);
                const hashUrl = data[0].slice(indexStart, indexEnd);
                if (url[0].includes('#')) {
                  simpleUrl = url[0].slice(0, url[0].indexOf('#'));
                  simpleUrl += hashUrl;
                } else {
                  simpleUrl = url[0];
                  simpleUrl += hashUrl;
                }
              }
              if (data[0].indexOf('href="#') === -1) {
                simpleUrl = url[0];
              } else {
                isHashThere();
              }

              chrome.tabs.executeScript(
                {
                  code: 'document.title',
                },
                title => {
                  const newText = data[0]
                    .replace(/<(\/a|a)([^>]*)>/gi, '')
                    .replace(/<(\/span|span)([^>]*)>/gi, '')
                    .replace(/<(\/code|code)([^>]*)>/gi, '')
                    .replace(/#/gi, '');

                  const newTodoObj = {
                    text: newText,
                    url: simpleUrl,
                    title: title,
                    id: this.model.getRandomNumber(),
                    addDay: `${month}.${date}. ${hour}:${minute}`,
                  };
                  this.model.pushDataToStorage(
                    newTodoObj,
                    this.model.todoStorage
                  );
                  this.model.saveTodo('MarcoTODO', this.model.todoStorage);
                  this.createTodoHandler(newTodoObj);
                  this.view.renderCounter();
                  document.addEventListener('click', function (e) {
                    if (e.target.href !== undefined) {
                      chrome.tabs.create({ url: e.target.href });
                    }
                  });
                }
              );
            }
          );
        }
      );
    };

    chrome.tabs.executeScript(
      { code: "document.querySelectorAll('h1, h2, h3, h4').length" },
      function (length) {
        let i = 0;
        while (i < length) {
          getAll(i);
          i++;
        }
      }
    );
  }

  initSearchForm() {
    document
      .getElementById('form')
      .addEventListener('submit', this.searchFormHandler.bind(this));
    document
      .getElementById('search-input')
      .addEventListener('keyup', this.searchFormHandler.bind(this));
    document
      .getElementById('search-close-btn')
      .addEventListener('click', () => {
        this.view.hideSearchResult();
      });
  }

  searchFormHandler(e) {
    e.preventDefault();
    const $input = document.getElementById('search-input');
    const value = $input.value.toLowerCase();
    this.view.clearSearchResult();
    let isThereResult = false;
    if (value === '') {
      const text = 'Please enter a search term.';
      this.view.renderNoResult(text);
      this.view.showSearchResult();
      return;
    }
    this.model.completeStorage.forEach(v => {
      const targetText = v.text.toLowerCase();
      const targetTitle = v.title[0].toLowerCase();
      if (
        targetText.indexOf(value) !== -1 ||
        targetTitle.indexOf(value) !== -1
      ) {
        this.createSearchResultHandler(v);
        isThereResult = true;
      }
    });
    if (isThereResult === false) {
      const text = `There were no results found for '${value}'.`;
      this.view.renderNoResult(text);
      this.view.showSearchResult();
    }
  }

  beautifyTime(number) {
    return number < 10 ? `0${number}` : number;
  }

  createTodoHandler(obj) {
    const $li = document.createElement('li');
    $li.className = 'todo-line';
    $li.id = obj.id;

    const $div = document.createElement('div');
    $div.className = 'todo-span';
    const $todoSpan = document.createElement('span');
    $todoSpan.className = 'todo-span';
    $todoSpan.innerHTML = obj.text;

    const $link = document.createElement('a');
    $link.href = obj.url;
    $link.setAttribute('target', '_blank');

    const $completeBtn = document.createElement('button');
    $completeBtn.className = 'complete-btn';
    const storage = this.model.completeStorage;
    if (this.checkIfSavedUrl(obj.url, storage) === true) {
      $completeBtn.classList.add('saved');
      $completeBtn.innerText = 'Saved';
    } else {
      $completeBtn.innerText = 'Save';
      $completeBtn.addEventListener('click', e =>
        TodoController.prototype.completeBtnHandler.call(this, e)
      );
    }
    $link.appendChild($todoSpan);
    $div.appendChild($link);
    $li.appendChild($div);
    $li.appendChild($completeBtn);
    this.view.renderTodo($li);
    this.view.renderCounter();

    return $li;
  }

  createCompleteElement(obj) {
    const $li = document.createElement('li');
    $li.className = 'done-line';
    $li.id = obj.id;
    const $addDaySpan = document.createElement('span');
    $addDaySpan.className = 'add-day-done';
    $addDaySpan.innerText = obj.addDay;

    const $link = document.createElement('a');
    $link.href = obj.url;
    $link.setAttribute('target', '_blank');

    const $title = document.createElement('span');
    $title.className = 'title-span';
    $title.innerText = obj.title;

    const $div = document.createElement('div');
    $div.className = 'divBox';

    const $doneSpan = document.createElement('div');
    $doneSpan.className = 'done-span';
    $doneSpan.innerHTML = obj.text;

    const $modifyBtn = document.createElement('button');
    $modifyBtn.className = 'modify-btn';
    $modifyBtn.innerText = 'Edit';
    $modifyBtn.addEventListener('click', e =>
      TodoController.prototype.modifyBtnHandler.call(this, e)
    );

    const $deleteBtn = document.createElement('button');
    $deleteBtn.className = 'delete-btn';
    $deleteBtn.innerText = 'Delete';
    $deleteBtn.addEventListener('click', e =>
      TodoController.prototype.deleteBtnHandler.call(this, e)
    );

    $li.appendChild($addDaySpan);
    $li.appendChild($modifyBtn);
    $li.appendChild($deleteBtn);
    $link.appendChild($doneSpan);
    $div.appendChild($link);

    $li.appendChild($title);
    $li.appendChild($div);

    return $li;
  }

  createCompleteHandler(obj) {
    this.view.renderComplete(this.createCompleteElement(obj));
    this.view.renderCounter();
  }

  createSearchResultHandler(obj) {
    this.view.showSearchResult();
    this.view.renderSearchResult(this.createCompleteElement(obj));
  }

  modifyBtnHandler(e) {
    e.preventDefault();
    const $li = e.target.parentElement;
    const theId = $li.id;
    const $modifyForm = document.createElement('form');
    $modifyForm.className = 'modify-form';

    const $modifyInput = document.createElement('input');
    $modifyInput.className = 'modify-input';
    const modifyObj = this.model.completeStorage.find(
      todo => todo.id === parseInt(theId, 10)
    );
    $modifyInput.value = modifyObj.text;

    const modifySubmitHandler = () => {
      const changedText = $modifyInput.value;
      const modifyObj = this.model.completeStorage.find(
        todo => todo.id === parseInt(theId, 10)
      );
      const modifyObjIndex = this.model.completeStorage.findIndex(
        todo => todo.id === parseInt(theId, 10)
      );

      modifyObj.text = changedText;
      this.model.completeStorage.splice(modifyObjIndex, 1, modifyObj);
      this.model.saveTodo(TodoModel.COMPLETE_KEY, this.model.completeStorage);
      const $modifiedLine = this.createCompleteElement(modifyObj);

      $li.replaceWith($modifiedLine);
    };
    $modifyForm.onsubmit = function (event) {
      event.preventDefault();
      modifySubmitHandler();
    };

    const $modifyBtn = document.createElement('button');
    $modifyBtn.className = 'modified-btn';
    $modifyBtn.innerText = 'Edit done';

    $modifyForm.appendChild($modifyInput);
    $modifyForm.appendChild($modifyBtn);
    $li.childNodes[1].replaceWith($modifyForm);
    $li.childNodes[2].remove();
    $li.childNodes[2].remove();
    $li.childNodes[2].remove();

    $modifyInput.focus();
  }

  deleteBtnHandler(e) {
    const $li = e.target.parentElement;

    $li.remove();
    this.model.completeStorage = this.model.completeStorage.filter(
      todo => todo.id !== parseInt($li.id, 10)
    );
    this.model.saveTodo(TodoModel.COMPLETE_KEY, this.model.completeStorage);
    this.view.renderCounter();
  }

  completeBtnHandler(e) {
    e.preventDefault();
    e.target.classList.add('saved');
    e.target.innerText = 'Saved';
    const $li = e.target.parentElement;
    const completeObj = this.model.todoStorage.find(
      todo => todo.id === parseInt($li.id, 10)
    );
    this.model.todoStorage = this.model.todoStorage.filter(
      todo => todo.id !== parseInt($li.id, 10)
    );
    this.model.saveTodo(TodoModel.TODO_KEY, this.model.todoStorage);
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = TodoController.prototype.beautifyTime(now.getHours());
    const minute = TodoController.prototype.beautifyTime(now.getMinutes());
    this.model.completeStorage.push(completeObj);
    this.createCompleteHandler(completeObj);
    this.model.saveTodo(TodoModel.COMPLETE_KEY, this.model.completeStorage);
  }

  changeDivOrder(e) {
    function orderToggle() {
      let buttonValue = document.getElementById('order-btn').innerText;
      if (buttonValue === 'Move saved list up') {
        document.getElementById('order-btn').innerText =
          'Move scrap targets up';
        document
          .getElementById('order-btn')
          .classList.replace('orange', 'blue');
        let content = document.getElementById('Bcontainer');
        let parent = content.parentNode;
        parent.insertBefore(content, parent.firstChild);
      } else if (buttonValue === 'Move scrap targets up') {
        document.getElementById('order-btn').innerText = 'Move saved list up';
        document
          .getElementById('order-btn')
          .classList.replace('blue', 'orange');
        let content = document.getElementById('Acontainer');
        let parent = content.parentNode;
        parent.insertBefore(content, parent.firstChild);
      }
    }
    const orderBtn = document.getElementById('order-btn');
    orderBtn.addEventListener('click', orderToggle);
  }

  initAchievement() {
    const showAchievementBtn = document.getElementById('achievement-btn');
    const closeBtn = document.getElementById('close-btn');
    showAchievementBtn.addEventListener('click', () => {
      this.view.showAchievementBox();
      this.createAchievementsByDateHandler.bind(this)();
    });
    closeBtn.addEventListener('click', () => {
      this.view.hideAchievementBox();
      this.view.clearAchievement();
      this.alreadyShow = false;
    });
  }

  createAchievementsByDateHandler() {
    if (this.alreadyShow === true) {
      return;
    }
    this.alreadyShow = true;
    const collectionByDate = {};
    this.model.completeStorage.forEach(obj => {
      const targetDate = obj.addDay.slice(0, 5);
      if (!Object.keys(collectionByDate).includes(targetDate)) {
        collectionByDate[targetDate] = [];
      }
    });

    this.model.completeStorage.forEach(obj => {
      const targetDate = obj.addDay.slice(0, 5);
      collectionByDate[targetDate].push(obj);
    });
    const createDateAchievement = (obj, date) => {
      const $li = document.createElement('div');
      $li.className = 'achievement-Card';
      const $dayDiv = document.createElement('div');
      $dayDiv.className = 'day-div';
      const $daySpan = document.createElement('span');
      $daySpan.innerText = date;
      $daySpan.className = 'achievement-day';
      const $counter = document.createElement('div');
      $counter.innerText = Object.keys(obj).length;
      $counter.className = 'counter';
      $dayDiv.appendChild($daySpan);

      $dayDiv.appendChild($counter);
      $li.appendChild($dayDiv);

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const $doneSpan = document.createElement('div');
          $doneSpan.innerHTML = obj[key].text;
          $doneSpan.className = 'achievement-span';

          const $link = document.createElement('a');
          $link.href = obj[key].url;
          $link.setAttribute('target', '_blank');
          const $title = document.createElement('span');
          $title.className = 'title-span';
          $title.innerText = obj[key].title;

          $li.appendChild($title);
          $link.appendChild($doneSpan);
          $li.appendChild($link);
        }
      }
      this.view.renderAchievement($li);
    };

    for (const date in collectionByDate) {
      if (Object.prototype.hasOwnProperty.call(collectionByDate, date)) {
        createDateAchievement(collectionByDate[date], date);
      }
    }
  }

  checkIfSavedUrl(url, storage) {
    for (let i = 0; i < storage.length; i++) {
      if (url === storage[i].url) {
        return true;
      }
    }
    return false;
  }
}
