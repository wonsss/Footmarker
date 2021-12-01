completeBtnHandler;
e.target.classList.add('saved');
e.target.innerText = 'Saved';

createTodoHandler;

const $completeBtn = document.createElement('button');
$completeBtn.className = 'complete-btn';
if (this.checkIfSavedUrl(obj.url) === true) {
  $completeBtn.classList.add('saved');
  $completeBtn.innerText = 'Saved';
} else {
  $completeBtn.innerText = 'Save';
  $completeBtn.addEventListener('click', e =>
    TodoController.prototype.completeBtnHandler.call(this, e)
  );
}

createTodoHandler;
if (this.checkIfSavedUrl(obj.url) === true) {
  $completeBtn.classList.add('saved');
}
