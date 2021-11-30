function generateRandom(array) {
  if (!array) {
    var array = [];
  }
  let n = Math.floor(Math.random() * 45) + 1;
  if (array.length < 6 && array.indexOf(n) < 0) {
    array.push(n);
    return generateRandom(array);
  } else {
    return array;
  }
}
console.log(generateRandom([1, 2, 3]));
