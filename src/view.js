export default class TodoView {
  constructor(
    model,
    {
      $toDoList,
      $doneList,
      $todoCount,
      $completeCount,
      $achievementDiv,
      $searchResultBox,
      $searchResult,
      $searchCount,
      $achievementBox,
    }
  ) {
    this.model = model;
    this.$toDoList = $toDoList;
    this.$doneList = $doneList;
    this.$todoCount = $todoCount;
    this.$completeCount = $completeCount;
    this.$achievementDiv = $achievementDiv;
    this.$searchResultBox = $searchResultBox;
    this.$searchResult = $searchResult;
    this.$searchCount = $searchCount;
    this.$achievementBox = $achievementBox;
  }

  renderTodo(li) {
    this.$toDoList.append(li);
  }

  renderComplete(li) {
    this.$doneList.prepend(li);
  }

  renderCounter() {
    this.$todoCount.innerText = this.model.todoStorage.length;
    this.$completeCount.innerText = this.model.completeStorage.length;
  }

  renderSearchResult(li) {
    this.$searchResult.append(li);
  }

  renderSearchCounter(num) {
    this.$searchCount.innerText = num;
  }

  clearSearchResult() {
    this.$searchResult.innerHTML = "";
  }

  renderNoResult(text) {
    this.$searchResult.innerHTML = `<span class='noResult'>${text}</span>`;
  }

  showSearchResult() {
    this.$searchResultBox.classList.add("show");
  }

  hideSearchResult() {
    this.$searchResultBox.classList.remove("show");
  }

  showAchievementBox() {
    this.$achievementBox.classList.add("show");
  }

  hideAchievementBox() {
    this.$achievementBox.classList.remove("show");
  }

  renderAchievement(li) {
    this.$achievementDiv.prepend(li);
  }

  clearAchievement() {
    this.$achievementDiv.innerHTML = "";
  }
}
