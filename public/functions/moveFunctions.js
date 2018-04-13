/**
 * get moves logic
 */

function getPeonMoves(box, scope) {

    let selectedBoxes = new Array();

    if ((box.x + 1) < 8 && scope.table[box.y][box.x + 1].piece === undefined && box.piece.color == 'black') { //Black move
        selectedBoxes.push(scope.table[box.y][box.x + 1]);
        if ((box.x + 2) < 8 && scope.table[box.y][box.x + 2].piece === undefined && box.piece.firstMove == true) { //The firs time a peon can move 2 boxes
            selectedBoxes.push(scope.table[box.y][box.x + 2]);
        }

    } else if ((box.x - 1) >= 0 && scope.table[box.y][box.x - 1].piece === undefined && box.piece.color == 'white') { //White move
        selectedBoxes.push(scope.table[box.y][box.x - 1]);
        if ((box.x - 2) >= 0 && scope.table[box.y][box.x - 2].piece === undefined && box.piece.firstMove == true) { //The firs time a peon can move 2 boxes
            selectedBoxes.push(scope.table[box.y][box.x - 2]);
        }
    }
    if ((box.x + 1) < 8 && (box.y + 1) < 8 && scope.table[box.y + 1][box.x + 1].piece !== undefined && box.piece.color == 'black' && scope.table[box.y + 1][box.x + 1].piece.color == "white") {
        selectedBoxes.push(scope.table[box.y + 1][box.x + 1]);
        scope.table[box.y + 1][box.x + 1].piece.threatened = true;
    } else if ((box.x - 1) >= 0 && (box.y + 1) < 8 && scope.table[box.y + 1][box.x - 1].piece !== undefined && box.piece.color == 'white' && scope.table[box.y + 1][box.x - 1].piece.color == "black") {
        selectedBoxes.push(scope.table[box.y + 1][box.x - 1]);
        scope.table[box.y + 1][box.x - 1].piece.threatened = true;
    }
    if ((box.x + 1) < 8 && (box.y - 1) >= 0 && scope.table[box.y - 1][box.x + 1].piece !== undefined && box.piece.color == 'black' && scope.table[box.y - 1][box.x + 1].piece.color == "white") {
        selectedBoxes.push(scope.table[box.y - 1][box.x + 1]);
        scope.table[box.y - 1][box.x + 1].piece.threatened = true;
    } else if ((box.x - 1) >= 0 && (box.y - 1) >= 0 && scope.table[box.y - 1][box.x - 1].piece !== undefined && box.piece.color == 'white' && scope.table[box.y - 1][box.x - 1].piece.color == "black") {
        selectedBoxes.push(scope.table[box.y - 1][box.x - 1]);
        scope.table[box.y - 1][box.x - 1].piece.threatened = true;
    }

    return selectedBoxes;
}

/**
 * Select Queen, Bishop and Tower selected boxes
 * @param {*} box 
 * @param {*} scope 
 */
function getQBTMoves(box, scope) {

    var rBlocked = false,
        lBlocked = false,
        tBlocked = false,
        bBlocked = false,
        rtBlocked = false,
        rbBlocked = false,
        ltBlocked = false,
        lbBlocked = false;
    var selectedBoxes = new Array();

    for (var i = 1; i < 8; i++) {
        if (box.piece != undefined && box.piece.type != "bishop") { //Queen and Tower selectedPieces
            window.alert(box.piece.type);
            if (!rBlocked && (box.x + i) < 8 && scope.table[box.y][box.x + i] != undefined && scope.table[box.y][box.x + i].piece == undefined) { //Selects the right
                selectedBoxes.push(scope.table[box.y][box.x + i]);
            } else if (!rBlocked && (box.x + i) < 8 && scope.table[box.y][box.x + i] != undefined && scope.table[box.y][box.x + i].piece != undefined) {
                rBlocked = true;
                if (scope.table[box.y][box.x + i].piece != undefined && scope.table[box.y][box.x + i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y][box.x + i]);
                    scope.table[box.y][box.x + i].piece.threatened = true;
                }
            }
            if (!lBlocked && (box.x - i) >= 0 && scope.table[box.y][box.x - i] != undefined && scope.table[box.y][box.x - i].piece == undefined) { //Selects the left
                selectedBoxes.push(scope.table[box.y][box.x - i]);
            } else if (!lBlocked && (box.x - i) >= 0 && scope.table[box.y][box.x - i] != undefined && scope.table[box.y][box.x - i].piece != undefined) {
                lBlocked = true;
                if (scope.table[box.y][box.x - i].piece != undefined && scope.table[box.y][box.x - i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y][box.x - i]);
                    scope.table[box.y][box.x - i].piece.threatened = true;
                }
            }
            if (!tBlocked && (box.y + i) < 8 && scope.table[box.y + i][box.x] != undefined && scope.table[box.y + i][box.x].piece === undefined) { //Selects the top
                selectedBoxes.push(scope.table[box.y + i][box.x]);
            } else if (!tBlocked && (box.y + i) < 8 && scope.table[box.y + i][box.x] != undefined && scope.table[box.y + i][box.x].piece != undefined) {
                tBlocked = true;
                if (scope.table[box.y + i][box.x].piece != undefined && scope.table[box.y + i][box.x].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y + i][box.x]);
                    scope.table[box.y + i][box.x].piece.threatened = true;
                }
            }
            if (!bBlocked && (box.y - i) >= 0 && scope.table[box.y - i][box.x] != undefined && scope.table[box.y - i][box.x].piece === undefined) { //Selects the buttom
                selectedBoxes.push(scope.table[box.y - i][box.x]);
            } else if (!bBlocked && (box.y - i) >= 0 && scope.table[box.y - i][box.x] != undefined && scope.table[box.y - i][box.x].piece != undefined) {
                bBlocked = true;
                if (scope.table[box.y - i][box.x].piece != undefined && scope.table[box.y - i][box.x].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y - i][box.x]);
                    scope.table[box.y - i][box.x].piece.threatened = true;
                }
            }
        }
        if (box.piece != undefined && box.piece.type != "tower") { //Queen and Bishop selected pieces
            if (!rtBlocked && (box.y + i) < 8 && (box.x + i) < 8 && scope.table[box.y + i][box.x + i] != undefined && scope.table[box.y + i][box.x + i].piece === undefined) { //Right top diagonal
                selectedBoxes.push(scope.table[box.y + i][box.x + i]);
            } else if (!rtBlocked && (box.y + i) < 8 && (box.x + i) < 8 && scope.table[box.y + i][box.x + i] != undefined && scope.table[box.y + i][box.x + i].piece != undefined) {
                rtBlocked = true;
                if (scope.table[box.y + i][box.x + i].piece != undefined && scope.table[box.y + i][box.x + i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y + i][box.x + i]);
                    scope.table[box.y + i][box.x + i].piece.threatened = true;
                }
            }
            if (!rbBlocked && (box.y - i) >= 0 && (box.x + i) < 8 && scope.table[box.y - i][box.x + i] != undefined && scope.table[box.y - i][box.x + i].piece === undefined) { //Right button diagonal
                selectedBoxes.push(scope.table[box.y - i][box.x + i]);
            } else if (!rbBlocked && (box.y - i) >= 0 && (box.x + i) < 8 && scope.table[box.y - i][box.x + i] != undefined && scope.table[box.y - i][box.x + i].piece != undefined) {
                rbBlocked = true;
                if (scope.table[box.y - i][box.x + i].piece != undefined && scope.table[box.y - i][box.x + i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y - i][box.x + i]);
                    scope.table[box.y - i][box.x + i].piece.threatened = true;
                }
            }
            if (!ltBlocked && (box.y + i) < 8 && (box.x - i) >= 0 && scope.table[box.y + i][box.x - i] != undefined && scope.table[box.y + i][box.x - i].piece === undefined) { //Left top diagonal
                selectedBoxes.push(scope.table[box.y + i][box.x - i]);
            } else if (!ltBlocked && (box.y + i) < 8 && (box.x - i) >= 0 && scope.table[box.y + i][box.x - i] != undefined && scope.table[box.y + i][box.x - i].piece != undefined) {
                ltBlocked = true;
                if (scope.table[box.y + i][box.x - i].piece != undefined && scope.table[box.y + i][box.x - i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y + i][box.x - i]);
                    scope.table[box.y + i][box.x - i].piece.threatened = true
                }
            }
            if (!lbBlocked && (box.y - i) >= 0 && (box.x - i) >= 0 && scope.table[box.y - i][box.x - i] != undefined && scope.table[box.y - i][box.x - i].piece === undefined) { //Left button diagonal
                selectedBoxes.push(scope.table[box.y - i][box.x - i]);
            } else if (!lbBlocked && (box.y - i) >= 0 && (box.x - i) >= 0 && scope.table[box.y - i][box.x - i] != undefined && scope.table[box.y - i][box.x - i].piece != undefined) {
                lbBlocked = true;
                if (scope.table[box.y - i][box.x - i].piece != undefined && scope.table[box.y - i][box.x - i].piece.color != box.piece.color) {
                    selectedBoxes.push(scope.table[box.y - i][box.x - i]);
                    scope.table[box.y - i][box.x - i].piece.threatened = true;
                }
            }
        }
    }

    return selectedBoxes;
}

function getKingMoves(box, scope) {
    var selectedBoxes = new Array();
    //Selects the vertical

    if ((box.x + 1) < 8 && scope.table[box.y][box.x + 1] != undefined && (scope.table[box.y][box.x + 1].piece == undefined || scope.table[box.y][box.x + 1].piece.color != box.piece.color)) {
        selectedBoxes.push(scope.table[box.y][box.x + 1]);
        if (scope.table[box.y][box.x + 1].piece != undefined && scope.table[box.y][box.x + 1].piece.color != box.piece.color) {
            scope.table[box.y][box.x + 1].piece.threatened = true;
        }
    }
    if ((box.x - 1) >= 0 && scope.table[box.y][box.x - 1] != undefined && (scope.table[box.y][box.x - 1].piece == undefined || scope.table[box.y][box.x - 1].piece.color != box.piece.color)) {
        selectedBoxes.push(scope.table[box.y][box.x - 1]);
        if (scope.table[box.y][box.x - 1].piece != undefined && scope.table[box.y][box.x - 1].piece.color != box.piece.color) {
            scope.table[box.y][box.x - 1].piece.threatened = true;
        }
    }
    if ((box.y + 1) < 8 && scope.table[box.y + 1][box.x] != undefined && (scope.table[box.y + 1][box.x].piece == undefined || scope.table[box.y + 1][box.x].piece.color != box.piece.color)) { //Selects the horizontal
        selectedBoxes.push(scope.table[box.y + 1][box.x]);
        if (scope.table[box.y + 1][box.x].piece != undefined && scope.table[box.y + 1][box.x].piece.color != box.piece.color) {
            scope.table[box.y + 1][box.x].piece.threatened = true;
        }
    }
    if ((box.y - 1) >= 0 && scope.table[box.y - 1][box.x] != undefined && (scope.table[box.y - 1][box.x].piece == undefined || scope.table[box.y - 1][box.x].piece.color != box.piece.color)) { //Selects the horizontal
        selectedBoxes.push(scope.table[box.y - 1][box.x]);
        if (scope.table[box.y - 1][box.x].piece != undefined && scope.table[box.y - 1][box.x].piece.color != box.piece.color) {
            scope.table[box.y - 1][box.x].piece.threatened = true;
        }
    }
    if ((box.x + 1) < 8 && (box.y + 1) < 8 && scope.table[box.y + 1][box.x + 1] != undefined && (scope.table[box.y + 1][box.x + 1].piece == undefined || scope.table[box.y + 1][box.x + 1].piece.color != box.piece.color)) { //Right top diagonal
        selectedBoxes.push(scope.table[box.y + 1][box.x + 1]);
        if (scope.table[box.y + 1][box.x + 1].piece != undefined && scope.table[box.y + 1][box.x + 1].piece.color != box.piece.color) {
            scope.table[box.y + 1][box.x + 1].piece.threatened = true;
        }
    }
    if ((box.x + 1) < 8 && (box.y - 1) >= 0 && scope.table[box.y - 1][box.x + 1] != undefined && (scope.table[box.y - 1][box.x + 1].piece == undefined || scope.table[box.y - 1][box.x + 1].piece.color != box.piece.color)) { //Right button diagonal
        selectedBoxes.push(scope.table[box.y - 1][box.x + 1]);
        if (scope.table[box.y - 1][box.x + 1].piece != undefined && scope.table[box.y - 1][box.x + 1].piece.color != box.piece.color) {
            scope.table[box.y - 1][box.x + 1].piece.threatened = true;
        }
    }
    if ((box.y + 1) < 8 && (box.x - 1) >= 0 && scope.table[box.y + 1][box.x - 1] != undefined && (scope.table[box.y + 1][box.x - 1].piece == undefined || scope.table[box.y + 1][box.x - 1].piece.color != box.piece.color)) { //Left top diagonal
        selectedBoxes.push(scope.table[box.y + 1][box.x - 1]);
        if (scope.table[box.y + 1][box.x - 1].piece != undefined && scope.table[box.y + 1][box.x - 1].piece.color != box.piece.color) {
            scope.table[box.y + 1][box.x - 1].piece.threatened = true;
        }
    }
    if ((box.x - 1) >= 0 && (box.y - 1) >= 0 && scope.table[box.y - 1][box.x - 1] != undefined && (scope.table[box.y - 1][box.x - 1].piece == undefined || scope.table[box.y - 1][box.x - 1].piece.color != box.piece.color)) { //Left button diagonal
        selectedBoxes.push(scope.table[box.y - 1][box.x - 1]);
        if (scope.table[box.y - 1][box.x - 1].piece != undefined && scope.table[box.y - 1][box.x - 1].piece.color != box.piece.color) {
            scope.table[box.y - 1][box.x - 1].piece.threatened = true;
        }
    }

    return selectedBoxes;
}

function getHorseMoves(box, scope) {

    var selectedBoxes = new Array();

    if ((box.y + 1) < 8 && (box.x - 2) >= 0 && scope.table[box.y + 1][box.x - 2] != undefined && (scope.table[box.y + 1][box.x - 2].piece == undefined || scope.table[box.y + 1][box.x - 2].piece.color != box.piece.color)) { //Left top  L
        selectedBoxes.push(scope.table[box.y + 1][box.x - 2]);
        if (scope.table[box.y + 1][box.x - 2].piece != undefined && scope.table[box.y + 1][box.x - 2].piece.color != box.piece.color) {
            scope.table[box.y + 1][box.x - 2].piece.threatened = true;
        }
    }
    if ((box.y + 1) < 8 && (box.x + 2) < 8 && scope.table[box.y + 1][box.x + 2] != undefined && (scope.table[box.y + 1][box.x + 2].piece == undefined || scope.table[box.y + 1][box.x + 2].piece.color != box.piece.color)) { //Right top L
        selectedBoxes.push(scope.table[box.y + 1][box.x + 2]);
        if (scope.table[box.y + 1][box.x + 2].piece != undefined && scope.table[box.y + 1][box.x + 2].piece.color != box.piece.color) {
            scope.table[box.y + 1][box.x + 2].piece.threatened = true;
        }
    }
    if ((box.y - 1) >= 0 && (box.x - 2) >= 0 && scope.table[box.y - 1][box.x - 2] != undefined && (scope.table[box.y - 1][box.x - 2].piece == undefined || scope.table[box.y - 1][box.x - 2].piece.color != box.piece.color)) { //left bottom L
        selectedBoxes.push(scope.table[box.y - 1][box.x - 2]);
        if (scope.table[box.y - 1][box.x - 2].piece != undefined && scope.table[box.y - 1][box.x - 2].piece.color != box.piece.color) {
            scope.table[box.y - 1][box.x - 2].piece.threatened = true;
        }
    }
    if ((box.y - 1) >= 0 && (box.x + 2) < 8 && scope.table[box.y - 1][box.x + 2] != undefined && (scope.table[box.y - 1][box.x + 2].piece == undefined || scope.table[box.y - 1][box.x + 2].piece.color != box.piece.color)) { //Right bottom L
        selectedBoxes.push(scope.table[box.y - 1][box.x + 2]);
        if (scope.table[box.y - 1][box.x + 2].piece != undefined && scope.table[box.y - 1][box.x + 2].piece.color != box.piece.color) {
            scope.table[box.y - 1][box.x + 2].piece.threatened = true;
        }
    }
    if ((box.y + 2) < 8 && (box.x - 1) >= 0 && scope.table[box.y + 2][box.x - 1] != undefined && (scope.table[box.y + 2][box.x - 1].piece == undefined || scope.table[box.y + 2][box.x - 1].piece.color != box.piece.color)) { //Left top L
        selectedBoxes.push(scope.table[box.y + 2][box.x - 1]);
        if (scope.table[box.y + 2][box.x - 1].piece != undefined && scope.table[box.y + 2][box.x - 1].piece.color != box.piece.color) {
            scope.table[box.y + 2][box.x - 1].piece.threatened = true;
        }
    }
    if ((box.y + 2) < 8 && (box.x + 1) < 8 && scope.table[box.y + 2][box.x + 1] != undefined && (scope.table[box.y + 2][box.x + 1].piece == undefined || scope.table[box.y + 2][box.x + 1].piece.color != box.piece.color)) { //Right top L
        selectedBoxes.push(scope.table[box.y + 2][box.x + 1]);
        if (scope.table[box.y + 2][box.x + 1].piece != undefined && scope.table[box.y + 2][box.x + 1].piece.color != box.piece.color) {
            scope.table[box.y + 2][box.x + 1].piece.threatened = true;
        }
    }
    if ((box.y - 2) >= 0 && (box.x - 1) >= 0 && scope.table[box.y - 2][box.x - 1] != undefined && (scope.table[box.y - 2][box.x - 1].piece == undefined || scope.table[box.y - 2][box.x - 1].piece.color != box.piece.color)) { //left bottom L
        selectedBoxes.push(scope.table[box.y - 2][box.x - 1]);
        if (scope.table[box.y - 2][box.x - 1].piece != undefined && scope.table[box.y - 2][box.x - 1].piece.color != box.piece.color) {
            scope.table[box.y - 2][box.x - 1].piece.threatened = true;
        }
    }
    if ((box.y - 2) >= 0 && (box.x + 1) < 8 && scope.table[box.y - 2][box.x + 1] != undefined && (scope.table[box.y - 2][box.x + 1].piece == undefined || scope.table[box.y - 2][box.x + 1].piece.color != box.piece.color)) { //Right bottom L
        selectedBoxes.push(scope.table[box.y - 2][box.x + 1]);
        if (scope.table[box.y - 2][box.x + 1].piece != undefined && scope.table[box.y - 2][box.x + 1].piece.color != box.piece.color) {
            scope.table[box.y - 2][box.x + 1].piece.threatened = true;
        }
    }

    return selectedBoxes;
}