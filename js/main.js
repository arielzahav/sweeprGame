//sweepr Game
//My first Project with JS vanila!!


'use strict'

// Matrix contains  cell objects: 
//{     bombsAroundCount: 4,     isShown: true,     isBomb: false,     isMarked: true,     } 
const LEVELS = 3;
const BOMB_IMG = '<img src="img/bomb1.jpg">';
const FLAG_IMG = '<img src="img/flag1.png">';
const SMAILY1_IMG = '<img src="img/smaily1.jpg">';
const SMAILY2_IMG = '<img src="img/smaily2.jpg">';
const SMAILY3_IMG = '<img src="img/smaily3.jpg">';


//This is an object by which the board size is set (in this case: 4*4), and how many mines to put 
const gLevels = []; //{     SIZE: 4,     MINES: 2 };
gLevels[0] = { SIZE: 4, MINES: 2, NAME: 'level1', FWIN: true };
gLevels[1] = { SIZE: 6, MINES: 5, NAME: 'level2', FWIN: true };
gLevels[2] = { SIZE: 8, MINES: 15, NAME: 'level3', FWIN: true };

var gBoard = [];
var gGameLevel = 0 // initiat level of the game
var gIsfirstClick = true;
var gEmptyShown = 0;
var gStartTime = 0;
var gGameOn = false;

//initiate local storage
for (let index = 0; index < LEVELS; index++) {
    if (localStorage.getItem(gLevels[index].NAME) === null)
        localStorage.setItem(gLevels[index].NAME, JSON.stringify('00:00'));
    
}

// localStorage.setItem('level1', 0);
// localStorage.setItem('level2', 0);
// localStorage.setItem('level3', 0);

//   This is an object in which you can keep and update the current state:
// isGameOn – boolean, when true we let the user play shownCount: how many cells are shown markedCount: how many cells are marked (with a flag) secsPassed: how many seconds passed 
var gState = { isGameOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
var gMines = [];

//This is called when page loads 
function initGame() {
    gMines = [];
    gBoard = [];
    var elLevel = document.getElementById("level");
    var levelVal = elLevel.options[elLevel.selectedIndex].value;
    gGameLevel = parseInt(levelVal);
    document.getElementById('minesOnBoard').innerHTML = gLevels[gGameLevel].MINES;
    document.getElementById('smilyState').innerHTML = SMAILY1_IMG;
    document.getElementById('bestScore').innerHTML = (localStorage.getItem(gLevels[gGameLevel].NAME));
    document.getElementById('timer').innerHTML = '00:00';
    gEmptyShown = 0;
    gGameOn = false;
    gIsfirstClick = true;
    buildBoard();
    renderBoard(gBoard);
    console.dir(gMines);
}

function changeLevel(elCell) {
    initGame();
}

//Builds the board by setting mines at random locations, 
//and then calling the setMinesNegsCount() Then return the created board 
function buildBoard() {
    var SIZE = gLevels[gGameLevel].SIZE;
    for (let i = 0; i < SIZE; i++) {
        gBoard[i] = [];
        for (let j = 0; j < SIZE; j++) {
            var cell = { bombsAroundCount: 0, isShown: false, isBomb: false, isMarked: false }
            gBoard[i][j] = cell;
        }
    }
}

function setMinesOnBoard(elCell) {
    var MINES = gLevels[gGameLevel].MINES
    var SIZE = gLevels[gGameLevel].SIZE
    var coord = getCellCoord(elCell.id);
    for (let i = 0; i < MINES; i++) {
        do {
            var inI = Math.round(Math.random() * (SIZE - 1))
            var inJ = Math.round(Math.random() * (SIZE - 1))

        } while ((checkIfCellIsBomb(gBoard, getCoord(inI, inJ)) || (inI === coord.i && inJ === coord.j)))
        //update the mine on board and in array
        updateMineOnBoard(gBoard, getCoord(inI, inJ));
        gMines.push(getCoord(inI, inJ));
        console.log(gMines)
    }
}

//Sets mines-count to neighbours
function setMinesNegsCount(board) {
    for (let i = 0; i < gMines.length; i++) {
        var inI = gMines[i].i;
        var inJ = gMines[i].j;
        setSingleNegCount(board, inI - 1, inJ - 1);
        setSingleNegCount(board, inI - 1, inJ);
        setSingleNegCount(board, inI - 1, inJ + 1);
        setSingleNegCount(board, inI, inJ - 1);
        setSingleNegCount(board, inI, inJ + 1);
        setSingleNegCount(board, inI + 1, inJ - 1);
        setSingleNegCount(board, inI + 1, inJ);
        setSingleNegCount(board, inI + 1, inJ + 1);
    }

}
function setSingleNegCount(board, i, j) {
    var SIZE = gLevels[gGameLevel].SIZE;
    if (i >= 0 && i < SIZE && j >= 0 && j < SIZE /*also if it bomb */) board[i][j].bombsAroundCount++;
}

//Print the board

function renderBoard(board) {
    var SIZE = gLevels[gGameLevel].SIZE;
    var strHtml = '';
    for (var i = 0; i < SIZE; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < SIZE; j++) {
            var cell = row[j].isBomb;
            var className = 'cell';
            var tdId = 'cell-' + i + '-' + j;
            strHtml += '<td id="' + tdId + '" onclick="mouseclick(this, event)" oncontextmenu="mouseclick(this,event)"' +
                'class="' + className + '">' /*+ cell*/ + '</td>';
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.gameBoard');
    elMat.innerHTML = strHtml;
}
// called when clicking with the mouse
function mouseclick(elCell, ev) {
    if (gIsfirstClick) {
        setMinesOnBoard(elCell);
        setMinesNegsCount(gBoard);
        gIsfirstClick = false;
        gGameOn = true;
        gStartTime = Date.now();
        setInterval(updateClock, 50);
    }
    if (ev.type === 'click') cellClicked(elCell); //if left click
    if (ev.type == 'contextmenu') cellMarked(elCell);//is right click

}

function updateClock() {
    if (gGameOn) {
        let time = parseInt((Date.now() - gStartTime) / 1000);
        let minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        // var elClock = document.getElementById('timer');
        // elClock.innerText = parseInt((Date.now() - gStartTime) / 1000);
        document.getElementById('timer').innerText = minutes +`:`+ seconds;
    }
}

//Called when a cell (td) is clicked (left click)
function cellClicked(elCell) {
    var coord = getCellCoord(elCell.id);
    console.log(coord);
    if (gBoard[coord.i][coord.j].isShown || gBoard[coord.i][coord.j].isMarked) return;
    if (gBoard[coord.i][coord.j].isBomb) {
        console.log('is Bomb!');
        // --> show this boomb and all othes and game over
        expandAllBombs(gBoard, elCell)
        elCell.style.backgroundColor = 'red'
        gameOverLose();
    } else {
        console.log('is not abomb');
        expandShown(gBoard, coord.i, coord.j);
        checkGameOver();
    }
}

function gameOverLose() {
    //disable all board
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            console.log(i, j)
            gBoard[i][j].isShown = true;
        }
    }
    document.getElementById('smilyState').innerHTML = SMAILY2_IMG;
    gGameOn = false;
}
function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}

function getCoord(i, j) {
    var coord = {};
    coord.i = i;
    coord.j = j;
    return coord;
}


//Called on right click to mark a cell as suspected to have a mine 
function cellMarked(elCell) {
    var coord = getCellCoord(elCell.id);
    if (gBoard[coord.i][coord.j].isShown) return;
    if (gBoard[coord.i][coord.j].isMarked) {
        gBoard[coord.i][coord.j].isMarked = false;
        // --> shouled remove the flag  
        elCell.innerHTML = '';
    } else {
        gBoard[coord.i][coord.j].isMarked = true;
        // -->should add flag
        elCell.innerHTML = FLAG_IMG;
        //  renderCell(coord, FLAG_IMG);

    }


}

//Game ends when all mines are marked and all the other cells are shown 
function checkGameOver() {
    var size = gLevels[gGameLevel].SIZE;
    var mines = gLevels[gGameLevel].MINES;
    if (gEmptyShown === size * size - mines) {//Game over
        document.getElementById('smilyState').innerHTML = SMAILY3_IMG;
        //disable all the board:
        for (let i = 0; i < gMines.length; i++) {
            gBoard[gMines[i].i][gMines[i].j].isShown = true;
        }
        gGameOn = false;
        updateLocalStorage();

    }
}
// update local storage with best time if needed
function updateLocalStorage() {
    var localBestTime = localStorage.getItem(gLevels[gGameLevel].NAME);
    var gameBestTime = document.getElementById("timer").innerHTML;
    if (gLevels[gGameLevel].FWIN) {
        localStorage.setItem(gLevels[gGameLevel].NAME, JSON.stringify(gameBestTime));
        gLevels[gGameLevel].FWIN = false;
    }
    else if (parseInt(gameBestTime) < parseInt(localBestTime)) {
        localStorage.setItem(gLevels[gGameLevel].NAME, JSON.stringify(gameBestTime));
    }

}

//When user clicks an empty   (0 negs), we need to open not only that cell, but also its neighbors.
function expandShown(board, i, j) {
    var SIZE = gLevels[gGameLevel].SIZE;
    var coord = getCoord(i, j)
    if (checkIfCanSetCell(board,i,j)) {
        board[i][j].isShown = true;
        gEmptyShown++;
        
        //elCell.innerHTML = board[i][j].bombsAroundCount;
        // --> add clase that it shown
        if (board[i][j].bombsAroundCount === 0) {
            renderCell(coord,'');
            expandShown(board,i - 1,j - 1);
            expandShown(board,i - 1,j    );
            expandShown(board,i - 1,j + 1);
            expandShown(board,i    ,j - 1);
            expandShown(board,i    ,j + 1);
            expandShown(board,i + 1,j - 1);
            expandShown(board,i + 1,j    );
            expandShown(board,i + 1,j + 1);
        } else renderCell(coord, board[i][j].bombsAroundCount);
    }

}
function checkIfCanSetCell(board,i,j){
    var SIZE = gLevels[gGameLevel].SIZE;
    if((i >= 0 && i < SIZE && j >= 0 && j < SIZE) &&
     (!board[i][j].isMarked && !board[i][j].isShown && !board[i][j].isBomb)) return true
    return false;
}


function expandAllBombs(board, elCell) {
    for (let i = 0; i < gMines.length; i++) {
        console.log(gMines);
        //elCell.innerHTML = BOMB_IMG;
        renderCell(gMines[i], BOMB_IMG);
        console.log(i, gMines[i]);
        console.log(elCell);
        gBoard[gMines[i].i][gMines[i].j].isShown = 'true';  
    }
}


function checkIfCellIsBomb(gBoard, cord) {
    return (gBoard[cord.i][cord.j].isBomb)
}

function updateMineOnBoard(gBoard, cord) {
    gBoard[cord.i][cord.j].isBomb = 'true';

}
// when press on cell
function renderCell(location, value) {
    var cellSelector = getClassName(location)
    var elCell = document.getElementById(cellSelector);
    elCell.innerHTML = value;
    elCell.style.backgroundColor = 'rgb(247, 242, 242)'
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}
//to avoid right click
window.oncontextmenu = function () {

    return false;
}




