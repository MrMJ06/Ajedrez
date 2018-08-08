/**
 * Functions
 */

//Instantiate the table
function init(scope) {
    alert("here");
    var table = [];
    for (var i = 0; i < 8; i++) {
        var row = [];
        for (var j = 0; j < 8; j++) {
            row.push(putPiece(i, j, scope)); //add the pieces
        }
        table.push(row);
    }
    return table;
}

function initiateFunctions(scope, location, window, data) {

    scope.insertMessage = function (event) {
        if (event.keyCode == 13) {
            scope.chat.push(scope.newMessage);
            scope.newMessage = null;
            var chatBox = document.getElementById("chatBox");
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    scope.saveGame = function () {
        data.set({
            title: scope.title,
            time: scope.time,
        });
        location.path('/chess');
    };

    scope.restoreGame = function (g) {
        data.game = g;
        location.path('/chess');
    };

    scope.selectBox = function (box) {
        let selectedPiece;
        let selectedBoxes = new Array();

        /**
         * Takes the selectedPiece if exists and collect all the moves
         */
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (scope.table[i][j].selected && scope.table[i][j].piece != undefined && scope.table[i][j].piece.threatened == false) {
                    selectedPiece = scope.table[i][j];
                } else if (scope.table[i][j].selected) {
                    selectedBoxes.push(scope.table[i][j]);
                }
            }
        }

        /**
         * Check that a user want to move a piece and is his turn
         */
        if (selectedPiece != undefined && selectedPiece.piece != undefined && box !== selectedPiece && scope.turn == selectedPiece.piece.color && !scope.end && (scope.color == scope.turn || !scope.started)) {

            //Checks that the user want to move to a selected box
            if (selectedBoxes.indexOf(box) != -1) {

                if (selectedPiece.piece.type == "peon") { //Invalidate the peon to move two boxes
                    selectedPiece.piece.firstMove = false;

                    if (selectedPiece.piece.color == "white" && box.x == 0) {
                        selectedPiece.piece.type = "queen";
                    } else if (selectedPiece.piece.color == "black" && box.x == 7) {
                        selectedPiece.piece.type = "queen";
                    }
                }

                if (scope.turn == "black" && scope.table[box.y][box.x].piece != undefined) {
                    scope.blackScore += getScore(scope.table[box.y][box.x]);
                } else if (scope.turn == "white" && scope.table[box.y][box.x].piece != undefined) {
                    scope.whiteScore += getScore(scope.table[box.y][box.x]);
                }

                if (scope.table[box.y][box.x].piece != null && scope.table[box.y][box.x].piece.type == "king") {
                    scope.end = true;
                } else {
                    scope.turn = getNextTurn(scope.turn);
                }

                scope.table[box.y][box.x].piece = selectedPiece.piece;
                scope.table[selectedPiece.y][selectedPiece.x].piece = undefined;
                if (scope.started) {
                    scope.sendMove(box, selectedPiece);
                }
            }

            clearTable(scope);
        } else if (selectedPiece === undefined && !scope.end) { //Check that a user selected a box and there is no piece selected before
            clearTable(scope);
            box.selected = !box.selected;
            //If a user selects a piece then get their posible moves
            selectedBoxes = getSelectedBoxes(box, scope);
            selectBoxes(selectedBoxes);
        } else { //In any other case we clear the table
            clearTable(scope);
        }
    };
}

/**
 * Putting pieces 
 */
//TODO: implement revert move
function putPiece(i, j, scope) {
    var box = new Object();
    box.x = j;
    box.y = i;

    /**
     * initaiate peons
     */
    var color = "black";
    if(scope.game.color!=undefined){
        color = getNextTurn(scope.game.color);
    }

    if (j == 1) {
       
        box.piece = {
            type: "peon",
            color: color,
            x: j,
            y: i,
            firstMove: true,
            threatened: false,
        };
    } else if (j == 6) {
        box.piece = {
            type: "peon",
            color: getNextTurn(color),
            x: j,
            y: i,
            firstMove: true,
            threatened: false
        };
    }
    //Initiate towers
    else if (j === 0 && i === 0 || j === 0 & i === 7) {
        box.piece = {
            type: "tower",
            color: color,
            x: j,
            y: i,
            threatened: false
        };
    } else if (j === 7 && i === 0 || j === 7 & i === 7) {
        box.piece = {
            type: "tower",
            color: getNextTurn(color),
            x: j,
            y: i,
            threatened: false
        };
    }
    //Initiate horses
    else if (j === 0 && i === 1 || j === 0 & i === 6) {
        box.piece = {
            type: "horse",
            color: color,
            x: j,
            y: i,
            threatened: false
        };
    } else if (j === 7 && i === 1 || j === 7 & i === 6) {
        box.piece = {
            type: "horse",
            color: getNextTurn(color),
            x: j,
            y: i,
            threatened: false
        };
    }
    //Initiate bishops
    else if (j === 0 && i === 2 || j === 0 & i === 5) {
        box.piece = {
            type: "bishop",
            color: color,
            x: j,
            y: i,
            threatened: false
        };
    } else if (j === 7 && i === 2 || j === 7 & i === 5) {
        box.piece = {
            type: "bishop",
            color: getNextTurn(color),
            x: j,
            y: i,
            threatened: false
        };
    }
    //Initiate king and queen black
    else if (j === 0 && i === 3) {
        box.piece = {
            type: "king",
            color: color,
            x: j,
            y: i,
            threatened: false
        };
    } else if (j === 0 && i === 4) {
        box.piece = {
            type: "queen",
            color: color,
            x: j,
            y: i,
            threatened: false
        };
    }
    //Initiate king and queen white
    else if (j === 7 && i === 3) {
        box.piece = {
            type: "king",
            color: getNextTurn(color),
            x: j,
            y: i,
            threatened: false
        };
    } else if (j === 7 && i === 4) {
        box.piece = {
            type: "queen",
            color: getNextTurn(color),
            x: j,
            y: i,
            threatened: false
        };
    }

    return box;
}
/**
 * Clear the table from selected boxes
 */
function clearTable(scope) {
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            scope.table[i][j].selected = false;
            if (scope.table[i][j].piece != undefined) {
                scope.table[i][j].piece.threatened = false;
            }
        }
    }
}

function selectBoxes(selectedBoxes) {
    for (var i = 0; i < selectedBoxes.length; i++) {
        selectedBoxes[i].selected = true;
    }
}

function getFirstTurn() {
    var color;
    var randNumb;

    randNumb = Math.round(Math.random());

    if (randNumb == 1) {
        color = "white";
    } else {
        color = "black";
    }

    return color;
}

function getNextTurn(turn) {

    var nxtTurn;

    if (turn == "white") {
        nxtTurn = "black";
    } else {
        nxtTurn = "white";
    }

    return nxtTurn;
}


function getSelectedBoxes(box, scope) {
    var selectedBoxes;
    
    switch (box.piece.type) {
        case "peon":
            selectedBoxes = getPeonMoves(box, scope);
            break;
        case "tower":
        case "bishop":
        case "queen":
            selectedBoxes = getQBTMoves(box, scope);
            break;
        case "king":
            selectedBoxes = getKingMoves(box, scope);
            break;
        case "horse":
            selectedBoxes = getHorseMoves(box, scope);
            break;
    }
    return selectedBoxes;
}

function getScore(box) {
    var score;

    switch (box.piece.type) {
        case "peon":
            score = 1;
            break;
        case "queen":
            score = 9;
            break;
        case "tower":
            score = 5;
            break;
        case "king":
            score = 0;
            break;
        case "horse":
            score = 3;
            break;
        case "bishop":
            score = 3;
            break;
    }
    return score;
}


//TODO
function filterCheckMoves(moves, scope) {

    var enemyColor = getNextTurn(scope.turn);
    var enemyBoxes = getBoxes(enemyColor, scope);
    var deletedMoves = new Array();

    for (var i = 0; i < enemyBoxes.length; i++) {
        if (enemyBoxes[i].piece.type != "king") {
            var enemyMoves = getSelectedBoxes(enemyBoxes[i], scope);
            for (var j = 0; j < moves.length; j++) {
                if (moves[j] != undefined && contains(enemyMoves, moves[j]) && !contains(deletedMoves, moves[j])) {
                    //window.alert(moves[j].x+", "+moves[j].y);
                    deletedMoves.push(moves[j]);
                }
            }
        }
    }

    for (var k = 0; k < deletedMoves.length; k++) {
        moves.splice(moves.indexOf(deletedMoves[k]), 1);
    }
    // window.alert(moves);
    return moves;
}

function getBoxes(color, scope) {

    var table = scope.table;
    var boxes = new Array();
    for (var i = 0; i < table.length; i++) {
        for (var j = 0; j < table.length; j++) {
            if (table[i][j].piece != undefined && table[i][j].piece.color == color) {
                boxes.push(table[i][j]);
            }
        }
    }

    return boxes;
}


class Timer {
    constructor(minutes, seconds) {
        this.minutes = minutes;
        this.seconds = seconds;
    }


}

Timer.prototype.subSecond = function subSecond(scope) {
    if (this.seconds == 0 && this.minutes == 0) {
        scope.end = true;
        getWinner(scope);
    } else if (this.seconds == 0) {
        this.minutes = this.minutes - 1;
        this.seconds = 59;
    } else {
        this.seconds = this.seconds - 1;
    }
}


function getWinner(scope) {
    if (scope.whiteScore > scope.blackScore) {
        scope.turn = "white";
    } else if (scope.whiteScore < scope.blackScore) {
        scope.turn = "black";
    } else {
        if (scope.turn == "white") {
            scope.turn = "black";
        } else {
            scope.turn = "white";
        }
    }
}

function setInitialValues(scope, data) {
    scope.$apply(function () {
        scope.game.turn = "white";
        scope.game.started = true;
        scope.game.color = data.color;
        scope.game.table = init(scope);
    });
}

function movePiece(scope, data) {
    scope.$apply(function () {
        scope.game.table[data.dy][data.dx].piece = scope.game.table[data.oy][data.ox].piece;
        scope.game.table[data.oy][data.ox].piece = undefined;
        scope.game.turn = getNextTurn(scope.game.turn);
    });
}

/**
 * Peer configuration
 */