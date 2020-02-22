const styles = {
  default: {
    identifyingColor: "#000000",
    attributes: {
      color: "white",
      backgroundColor: "black",
      borderColor: "white",
    }
  },
  bright: {
    identifyingColor: "#FFFAFA",
    attributes: {
      color: "black",
      backgroundColor: "white",
      borderColor: "black",
    }
  },
  green: {
    identifyingColor: "#228B22",
    attributes: {
      color: "#006400",
      backgroundColor: "#00FF00",
      borderColor: "#006400",
    }
  },
  red: {
    identifyingColor: "#FF6347",
    attributes: {
      backgroundColor: "#8B0000",
      color: "#FF0000",
      borderColor: "#800000",
    }

  }
}

const ESCAPE_KEY_CODE = 27;

const body = document.querySelector("body");
const board = document.getElementById("board");
const colorSchemes = document.querySelector(".color-schemes");
const messageBoard = document.querySelector(".message-board");
const modalWrapper = document.querySelector(".modal-wrapper");
const modalDiv = document.querySelector(".modal");  
const replayBtn = document.querySelector(".replay-btn");
const solveBtn = document.getElementById("solve-btn");

let mainBoard;
let selectedStyle;

initialize();

function initialize() {
  initializeStyle("default");
  initializeStyleSection();
  initializeBoard();
  displayMessage("welcome :)");
  addEventListeners();
}

function replay() {
  clearBoard();
  displayMessage("one more :)");
}

function clearBoard() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      mainBoard[r][c] = null;
      setBoardValue(r, c, null);
    }
  }
}

function addEventListeners() {
  board.addEventListener("click", editField);
  solveBtn.addEventListener("click", () => { setTimeout(() => startSolving(),0)});
  replayBtn.addEventListener("click", () => {
    replayBtn.style.visibility = "hidden";
    replay();
  })
}

function canPlaceNumber(r, c, n) {
  let rowOK = checkRow()
  let columnOK = checkColumn();
  let boxOK = checkBox();
  const response = (columnOK && rowOK && boxOK);
  return response;  

  function checkRow() {
    const row = mainBoard[r];
    for (let j = 0; j < 9; j++) {
      if (j !== c && row[j] === n) return false;
    }
    return true;
  }

  function checkColumn() {
    for (let j = 0; j < 9; j++) {
      if (j !== r && mainBoard[j][c] === n) return false; 
    }
    return true;
  }

  function checkBox() {
    const boxRNo = Math.floor(r/3);
    const boxCNo = Math.floor(c/3);
    for (let row = boxRNo*3; row < (boxRNo+1)*3; row++) {
      for (let col = boxCNo*3; col < (boxCNo+1)*3; col++) {
        if (row !== r && col !== c && mainBoard[row][col] === n) {
          return false;
        }
      }
    }
    return true;
  }
}

function displayMessage(text) {
  messageBoard.textContent = text;
}

function displayNotSolvedMessage() {
  displayMessage("This sudoku couldn't be solved. The highlighted user input fields didn't pass the validation");
}

function editField(evt) {
  const targetField = evt.target;
  const classes = targetField.className.replace(" ", ".");
  const targetElement = document.querySelector(`.${classes}`);
  openModal();

  function openModal() {
    modalWrapper.style.display = "block";
    modalDiv.style.display = "block";
    modalDiv.addEventListener("click", setNumber);
    document.addEventListener("keydown", listenForEscape);
  
    function setNumber(evt) {
      if (evt.target.type !== "button") return;
      let value = evt.target.innerText;
      targetElement.innerText = value;
      targetElement.classList.add("user-input")
      let coordinates = targetElement.className.match(/\d/g);
      mainBoard[coordinates[0]][coordinates[1]] = parseInt(value);
      closeModal();
    }

    function listenForEscape(evt) {
      if (evt.keyCode === ESCAPE_KEY_CODE) {
        document.removeEventListener("keydown", listenForEscape);
        closeModal();
      }
    }
  
    function closeModal() {
      modalDiv.removeEventListener("click", setNumber);
      modalDiv.style.display = "none";
      modalWrapper.style.display = "none";
    }
  }
}

function initializeBoard() {
  mainBoard = (new Array(9).fill(null)).map(el => new Array(9).fill(null));
  for (let r = 0; r < 9; r++) {
    let row = document.createElement("div");
    row.className += `board-row row-${r}`;
    for (let c = 0; c < 9; c++) {
      let col = document.createElement("div");
      col.className += `board-col col-${r}-${c}`;
      row.appendChild(col);
    }
    board.appendChild(row);
  }
}

function initializeStyle(name) {
  const newStyle = styles[name];
  selectedStyle = name;
  Object.keys(newStyle.attributes).forEach(key => {
    body.style[key] = newStyle.attributes[key];
  });
}

function initializeStyleSection() {
  Object.keys(styles).forEach(style => {
    let button = document.createElement("button");
    let s = styles[style];
    button.className = "style-button";
    button.style.backgroundColor = `${s.identifyingColor}`;
    colorSchemes.appendChild(button);
    button.addEventListener("click", () => initializeStyle(style))
  });
}

function markUserInputIncorrect(r, c) {
  const element = document.querySelector(`.col-${r}-${c}`);
  element.classList.add("incorrect");
}

function startSolving() {
  const validBoard = validateUserInputs();
  if (validBoard) {
    solveSudoku(0, 0);
    displayMessage("🌸🌸🌸🌸🌸🌸")
    replayBtn.style.visibility = "visible";
  } else {
    displayNotSolvedMessage();
  }
}

function solveSudoku(r, c) {
  if (c === 9) {
    r+=1;
    c = 0;
  }
  if (r === 9) return true;

  let currValue = mainBoard[r][c];
  if (currValue === null) {
    for (let n = 1; n <= 9; n++) {
      if (canPlaceNumber(r,c,n)) {
        mainBoard[r][c] = n;
        setTimeout(() => setBoardValue(r, c, n), 0);
        let canSolve = solveSudoku(r, c+1);
        if (canSolve) {
          return true;
        } else {
          mainBoard[r][c] = null;
          setTimeout(() => setBoardValue(r, c, null), 0);
        }
      }
    }
  } else {
    return solveSudoku(r, c+1);
  }
}

function setBoardValue(r, c, value) {
  const element = document.querySelector(`.col-${r}-${c}`);
  element.textContent = value;
}

function validateUserInputs() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let value = mainBoard[r][c];
      if (value !== null) {
        let allowed = canPlaceNumber(r, c, value);
        if (!allowed) {
          setTimeout(() => { markUserInputIncorrect(r, c) }, 0);
          return false;
        }
      }
    }
  }
  return true;
}
