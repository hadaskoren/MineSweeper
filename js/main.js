'use strict'

// This holds the entire board gamee - includes array of objects that represents each cell
var gMineBoard = [];
// array of mines coordinates objs
var gMinesCords = [];
// flags that are not on mines
var gNumOfFlags = 0;
// This is an object by which the board size is set and how many mines to put
var gLevel = {
    SIZE: 4,
    MINES: 2
};

// This holds the number of mines left to found to show on screen
var gMinesLeft;
// This is an object in which I keep and update the current state
var gState = {
    shownCount: 0,
    markedCount: 0
};

var gLost = document.querySelector('.gameOver');
var gWon = document.querySelector('.wonGame');
// Time
var gTimePassed;
var gSecsInterval;

// This is called when page loads
function initGame() {
    gMineBoard = [];
    gMinesCords = [];
    gNumOfFlags = 0;
    gState.shownCount = 0;
    gState.markedCount = 0;
    gMinesLeft = gLevel.MINES;
    var elMinesLeft = document.querySelector('#flagID');
    elMinesLeft.innerText = gMinesLeft;
    if (gSecsInterval) clearInterval(gSecsInterval);
    gTimePassed  = 0;
    gSecsInterval = undefined;
    renderBoard();
    updateTime();
    gLost.style.display = 'none';
    gWon.style.display = 'none';
}

/* Builds the board by setting mines at random locations, and then calling the
setMinesNegsCount() Then return the created board*/
function buildBoard() {
    var bombCounter = 0; 
    for (var i = 0; i < gLevel.SIZE; i++) {
        gMineBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (Math.random() > 0.6 && bombCounter < gLevel.MINES) {
                gMineBoard[i][j] = {isMine: true, negs: 0, isOpen: false};
                gMinesCords.push({indexI: i, indexJ: j});
                bombCounter++;
            } else {
                gMineBoard[i][j] = {isMine: false, negs: 0, isOpen: false};
            }
        }
    }
}

// Sets mines-count to neighbours
function setMinesNegsCount(gMineBoard,gMinesCords) {
 
    //Go over the mines coordinates array
    for(var minesIndex = 0; minesIndex < gMinesCords.length; minesIndex++) {
        // Go over each cell around the mine cell and update the negs
        for (var i = gMinesCords[minesIndex].indexI-1; i <= gMinesCords[minesIndex].indexI+1; i++) {
            for (var j = gMinesCords[minesIndex].indexJ-1; j <= gMinesCords[minesIndex].indexJ+1; j++) {
                if ( i === gMinesCords[minesIndex].indexI && j === gMinesCords[minesIndex].indexJ ) continue;
                if ( i < 0 || i > gMineBoard.length-1) continue;
                if ( j < 0 || j > gMineBoard[0].length-1) continue;
                
                gMineBoard[i][j].negs += 1;
            }
        }
    }
}

// Print the board as a table
function renderBoard() {
    buildBoard();
    var strHtml = '';
    gMineBoard.forEach(function(cells,i){
        strHtml += '<tr>';
        cells.forEach(function(cell,j){
            var tdId = 'cell-' + i + '-' +j;
            strHtml += '<td id="'+tdId+'" onmousedown="clickIdentifier(event ,this)"</td>';
        });
        strHtml += '</tr>';
    });
    var elBoardContainer = document.querySelector('.boardContainer');
    elBoardContainer.innerHTML = strHtml;
    setMinesNegsCount(gMineBoard,gMinesCords);
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    // If this is the first click in the game
    if (!gSecsInterval) {
        gSecsInterval = setInterval(function () {
           gTimePassed++;
           updateTime();
        }, 100)        
    }
    // If the cell has a mine then Game Over!
    if(gMineBoard[i][j].isMine) {
        var cellId = '#cell-'+i+'-'+j;
        var elCell = document.querySelector(cellId);
        elCell.innerHTML = 'X';
        gLost.innerText = 'GAME OVER!';
        gLost.style.display = 'table';
        if (gSecsInterval) clearInterval(gSecsInterval);
        var elCells = document.getElementsByTagName('td');
        for(var i = 0; i < elCells.length; i++) {
            elCells[i].style.backgroundColor = 'grey';
        }
    } else {
        // Check if it's closed
        if(!gMineBoard[i][j].isOpen) {
            if (gMineBoard[i][j].negs > 0) {
                // update innerHtml
                elCell.innerHTML = gMineBoard[i][j].negs;
                // Update backgroundColor
                elCell.style.backgroundColor = 'grey';
                // update isOpen
                gMineBoard[i][j].isOpen = true;
                gState.shownCount++;
                checkGameOver();
            } else {
                // If closed and no neighbours, update to open and send to ExpandShown()
                gMineBoard[i][j].isOpen = true;
                // Update shownCount
                gState.shownCount++;
                checkGameOver();
                expandShown(gMineBoard, elCell, i, j);
            }
        }
    }
}

/* Expand the shown class to neighbors (only 2 levels supported) At this point I needed to
give each cell an ID (or a class) that looks like that: "cell-3-2" (3 and 2 are just examples) */
function expandShown(gMineBoard, elCell, cellI, cellJ) {
    var currCell;
    
    checkGameOver();
    // Check the cells around the cell we sent
    for (var i = cellI-1; i <= cellI+1; i++) {
        for (var j = cellJ-1; j <= cellJ+1; j++) {
            // Check that we are inside the borders of the board
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || i > gMineBoard.length-1) continue;
            if ( j < 0 || j > gMineBoard[0].length-1) continue;
            
            // Find that cell in html
            currCell = document.querySelector('#cell-'+i+'-'+j);
                // Ignore these cells
            if(currCell.children[0]) continue;
            else if(gMineBoard[i][j].isMine) continue;
            else if(gMineBoard[i][j].isOpen) continue;

                // Else no mine no flag and it's closed
                else {
                    // check if there are negs
                    if(gMineBoard[i][j].negs > 0) {
                        // Update the cell with negs
                        currCell.innerHTML = gMineBoard[i][j].negs;
                        // Update backgroundColor
                        currCell.style.backgroundColor = 'grey';
                        // update isOpen
                        gMineBoard[i][j].isOpen = true;
                        // Increase shownCount;
                        gState.shownCount++;
                        checkGameOver();
                    } else {
                        // if there are no negs we need to open more cells so we need to re-call the function.
                        // Update the cell we clicked and the one next to it with grey color
                        // Update shownCount
                        gState.shownCount++;
                        if(!elCell.children[0]) {
                            elCell.style.backgroundColor = 'grey';
                        } 
                        currCell.style.backgroundColor = 'grey';
                        // update isOpen
                        gMineBoard[i][j].isOpen = true;

                        expandShown(gMineBoard, currCell, i, j) ;
                        }
                    }
             }
      }
}

/* Called on right click to mark a cell as suspected to have a mine */
function cellMarked(elCell) {
    elCell.innerHTML = '<img class="flag" src="img/flag.png" alt=""></img>';
    var coords = getCellCoord(elCell.id);
    if(gMineBoard[coords.i][coords.j].isMine) {
        // If we hit the mine cell add it to markedCount
        gState.markedCount++;
        updateMinesLeft()
    } else {
        // Else just count the flags
        gNumOfFlags++;
        updateMinesLeft();
    }
    checkGameOver();
}

/* Game ends when all mines are marked.*/
function checkGameOver() {
    if(gState.shownCount + gState.markedCount === Math.pow(gLevel.SIZE,2)) {
        gWon.innerText = 'YOU WON!';
        gWon.style.display = 'table';
        if (gSecsInterval) clearInterval(gSecsInterval);
    }
}

function clickIdentifier(event, elCell) {
    if(event.button === 2) {
        if(elCell.children[0]){
            elCell.children[0].remove();
            var coords = getCellCoord(elCell.id);
            if(gMineBoard[coords.i][coords.j].isMine) {
                // If we hit the mine cell add it to markedCount
                gState.markedCount--;
                updateMinesLeft()
            } else {
                // Else just count the flags
                gNumOfFlags--;
                updateMinesLeft();
            }
            checkGameOver();
        } else{
            cellMarked(elCell);
        }
    } else if (event.button === 0) {
        // If there is no flag img
        if(!elCell.children[0]) {
            var coord = getCellCoord(elCell.id);
            cellClicked(elCell, coord.i, coord.j);
        }
    }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var coord = {i: 0, j : 0};
    coord.i = +strCellId.substring(5,strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-')+1);
    return coord;
}

function updateTime() {
    var elSpanTimer = document.querySelector('#spanTimer');
    elSpanTimer.innerText = gTimePassed / 10;
}

function updateMinesLeft() {
    var minesLeft = document.querySelector('#flagID');
    minesLeft.innerText = gMinesLeft - gState.markedCount - gNumOfFlags;
}