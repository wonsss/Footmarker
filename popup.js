/* eslint-disable import/extensions */
import TodoModel from './src/model.js';
import TodoView from './src/view.js';
import TodoController from './src/controller.js';

const dom = {
  $toDoList: document.getElementById('todo-list'),
  $doneList: document.getElementById('done-list'),
  $todoCount: document.getElementById('todo-count'),
  $completeCount: document.getElementById('complete-count'),
  $achievementDiv: document.getElementById('achievementDiv'),
};

window.addEventListener('DOMContentLoaded', () => {
  const model = new TodoModel();
  const view = new TodoView(model, dom);
  const controller = new TodoController(model, view);
  controller.init();
});
