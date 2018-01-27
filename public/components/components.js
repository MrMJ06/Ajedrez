var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {

  initiateFunctions($scope);
  $scope.table = init();

});

app.filter('range', function () {
  return function (input, total) {
    total = parseInt(total);

    for (var i = 0; i < total; i++) {
      input.push(i);
    }

    return input;
  };
});


/**
 * Functions
 */

function init() {
  var table = new Array();
  for (var i = 0; i < 8; i++) {
    var row = new Array();
    for (var j = 0; j < 8; j++) {
      row.push(putPiece(i, j)); //add the pieces
    }
    table.push(row);
  }
  return table;
}

function initiateFunctions(scope) {

  scope.selectBox = function (box) {
    var selectedPiece;
    var selectedBoxes = new Array();

    /**
     * Takes the selectedPiece if exists and collect all the moves
     */
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (scope.table[i][j].selected && scope.table[i][j].piece != undefined) {
          selectedPiece = scope.table[i][j];
        } else if (scope.table[i][j].selected && scope.table[i][j].piece === undefined) {
          selectedBoxes.push(scope.table[i][j]);
        }
      }
    }

    /**
     * Check that a user want to move a piece
     */
    if (selectedPiece != undefined && selectedPiece.piece != undefined && box !== selectedPiece) {

      //Checks that the user want to move to a selected box
      if (selectedBoxes.indexOf(box) != -1) {
        selectedPiece.piece.firstMove = false;
        scope.table[box.y][box.x].piece = selectedPiece.piece;
        scope.table[selectedPiece.y][selectedPiece.x].piece = undefined;
      }
      clearTable(scope);
    } else if (selectedPiece === undefined) { //Check that a user selected a box
      clearTable(scope);
      box.selected = !box.selected;

      //If a user selects a piece then show their posible moves
      switch (box.piece.type) {
        case "peon":
          showPeonMoves(box, scope);
          break;
        case "queen":
         
          showQueenMoves(box, scope);
          break;
        case "king":
          showKingMoves(box, scope);
          break;
        case "tower":
          showTowerMoves(box, scope);
          break;
        case "horse":
          showHorseMoves(box, scope);
          break;
        case "bishop":
          showBishopMoves(box, scope);
          break;
      }
    } else {
      clearTable(scope);
    }
  }
}

/**
 * Show moves logic
 */
//TODO: Fix commentaries and add the kill implementation
function showPeonMoves(box, scope) {

  if (scope.table[box.y][box.x + 1].piece === undefined && box.piece.color == 'black') { //Black move
    scope.table[box.y][box.x + 1].selected = true;
    if (scope.table[box.y][box.x + 2].piece === undefined && box.piece.firstMove == true) { //The firs time a peon can move 2 boxes
      scope.table[box.y][box.x + 2].selected = true;
    }
  } else if (scope.table[box.y][box.x - 1].piece === undefined && box.piece.color == 'white') { //White move
    scope.table[box.y][box.x - 1].selected = true;
    if (scope.table[box.y][box.x - 2].piece === undefined && box.piece.firstMove == true) { //The firs time a peon can move 2 boxes
      scope.table[box.y][box.x - 2].selected = true;
    }
  }
}

function showQueenMoves(box, scope) {

  var rBlocked = false, lBlocked = false, tBlocked = false, bBlocked = false, rtBlocked= false, rbBlocked= false, ltBlocked= false, lbBlocked = false;

  for (var i = 1; i < 8; i++) {
    if (!rBlocked && (box.x + i)<8 && scope.table[box.y][box.x + i]!=undefined && scope.table[box.y][box.x + i].piece == undefined) {//Selects the right
      scope.table[box.y][box.x + i].selected = true;
    }else if(!rBlocked && (box.x + i)<8 && scope.table[box.y][box.x + i]!=undefined && scope.table[box.y][box.x + i].piece != undefined){
      rBlocked = true;
    }
    if (!lBlocked && (box.x - i)>=0 && scope.table[box.y][box.x - i] != undefined && scope.table[box.y][box.x - i].piece == undefined) {//Selects the left
      scope.table[box.y][box.x - i].selected = true;
    }else if(!lBlocked && (box.x - i)>=0 && scope.table[box.y][box.x - i]!=undefined && scope.table[box.y][box.x - i].piece != undefined){
      lBlocked = true;
    }
    if (!tBlocked && (box.y + i)<8 && scope.table[box.y + i][box.x] != undefined && scope.table[box.y + i][box.x].piece === undefined) { //Selects the top
      scope.table[box.y + i][box.x].selected = true;
    }else if(!tBlocked && (box.y + i)<8 && scope.table[box.y + i][box.x] != undefined && scope.table[box.y + i][box.x].piece != undefined){
      tBlocked = true;
    }
    if (!bBlocked && (box.y - i)>=0 && scope.table[box.y - i][box.x]!= undefined&&scope.table[box.y - i][box.x].piece === undefined) { //Selects the buttom
      scope.table[box.y - i][box.x].selected = true;
    }else if(!bBlocked && (box.y - i)>=0 && scope.table[box.y + i][box.x] != undefined && scope.table[box.y - i][box.x].piece != undefined){
      bBlocked = true;
    }
    if (!rtBlocked && (box.y + i)<8 && (box.x + i)<8 && scope.table[box.y + i][box.x + i]!= undefined && scope.table[box.y + i][box.x + i].piece === undefined) { //Right top diagonal
      scope.table[box.y + i][box.x + i].selected = true;
    }else if(!rtBlocked && (box.y + i)<8 && (box.x + i)<8 && scope.table[box.y + i][box.x + i]!= undefined && scope.table[box.y + i][box.x + i].piece != undefined){
      rtBlocked=true;
    }
    if (!rbBlocked && (box.y - i)>=0 && (box.x + i)<8 && scope.table[box.y - i][box.x + i]!= undefined && scope.table[box.y - i][box.x + i].piece === undefined) { //Right button diagonal
      scope.table[box.y - i][box.x + i].selected = true;
    }else if(!rbBlocked && (box.y - i)>=0 && (box.x + i)<8 && scope.table[box.y - i][box.x + i]!= undefined && scope.table[box.y - i][box.x + i].piece != undefined){
      rbBlocked=true;
    }
    if (!ltBlocked && (box.y + i)<8 && (box.x - i)>=0 && scope.table[box.y + i][box.x - i]!= undefined && scope.table[box.y + i][box.x - i].piece === undefined) { //Left top diagonal
      scope.table[box.y + i][box.x - i].selected = true;
    }else if(!ltBlocked && (box.y + i)<8 && (box.x - i)>=0 && scope.table[box.y + i][box.x - i]!= undefined && scope.table[box.y + i][box.x - i].piece != undefined){
      ltBlocked = true;
    }
    if (!lbBlocked && (box.y - i)>=0 && (box.x - i)>=0 && scope.table[box.y - i][box.x - i]!= undefined && scope.table[box.y - i][box.x - i].piece === undefined) { //Left button diagonal
      scope.table[box.y - i][box.x - i].selected = true;
    }else if(!lbBlocked && (box.y - i)>=0 && (box.x - i)>=0 && scope.table[box.y - i][box.x - i]!= undefined && scope.table[box.y - i][box.x - i].piece != undefined){
      lbBlocked=true;
    }
  }
}

function showKingMoves(box, scope) {

  //Selects the vertical
  if (scope.table[box.y][box.x + 1]!= undefined && scope.table[box.y][box.x + 1].piece === undefined) {
    scope.table[box.y][box.x + 1].selected = true;
  }
  if (scope.table[box.y][box.x - 1]!= undefined && scope.table[box.y][box.x - 1].piece === undefined) {
    scope.table[box.y][box.x - 1].selected = true;
  }
  if (scope.table[box.y + 1][box.x]!= undefined && scope.table[box.y + 1][box.x].piece === undefined) { //Selects the horizontal
    scope.table[box.y + 1][box.x].selected = true;
  }
  if (scope.table[box.y - 1][box.x]!= undefined && scope.table[box.y - 1][box.x].piece === undefined) { //Selects the horizontal
    scope.table[box.y - 1][box.x].selected = true;
  }
  if (scope.table[box.y + 1][box.x + 1]!= undefined && scope.table[box.y + 1][box.x + 1].piece === undefined) { //Right top diagonal
    scope.table[box.y + 1][box.x + 1].selected = true;
  }
  if (scope.table[box.y - 1][box.x + 1]!= undefined && scope.table[box.y - 1][box.x + 1].piece === undefined) { //Right button diagonal
    scope.table[box.y - 1][box.x + 1].selected = true;
  }
  if (scope.table[box.y + 1][box.x - 1]!= undefined && scope.table[box.y + 1][box.x - 1].piece === undefined) { //Left top diagonal
    scope.table[box.y + 1][box.x - 1].selected = true;
  }
  if (scope.table[box.y - 1][box.x - 1]!= undefined && scope.table[box.y - 1][box.x - 1].piece === undefined) { //Left button diagonal
    scope.table[box.y - 1][box.x - 1].selected = true;
  }
}

function showTowerMoves(box, scope) {
  var rBlocked = false, lBlocked = false, tBlocked = false, bBlocked = false;
  for (var i = 1; i < 8; i++) {
    if (!rBlocked && (box.x + i)<8 && scope.table[box.y][box.x + i]!= undefined && scope.table[box.y][box.x + i].piece === undefined) {//Selects right
      scope.table[box.y][box.x + i].selected = true;
    }else if(!rBlocked && (box.x + i)<8 && scope.table[box.y][box.x + i]!= undefined && scope.table[box.y][box.x + i].piece != undefined){
      rBlocked = true;
    }
    if (!lBlocked && (box.x - i)>=0 && scope.table[box.y][box.x - i]!= undefined && scope.table[box.y][box.x - i].piece === undefined) {//Selects left
      scope.table[box.y][box.x - i].selected = true;
    }else if(!lBlocked && (box.x - i)>=0 && scope.table[box.y][box.x - i]!= undefined && scope.table[box.y][box.x - i].piece != undefined){
      lBlocked = true;
    }
    if (!tBlocked && (box.y + i)<8 && scope.table[box.y + i][box.x]!= undefined && scope.table[box.y + i][box.x].piece === undefined) { //Selects top
      scope.table[box.y + i][box.x].selected = true;
    }else if(!tBlocked && (box.y + i)<8 && scope.table[box.y+ i][box.x ]!= undefined && scope.table[box.y+ i][box.x].piece != undefined){
      tBlocked = true;
    }
    if (!bBlocked && (box.y - i)>=0 && scope.table[box.y - i][box.x]!= undefined && scope.table[box.y - i][box.x].piece === undefined) { //Selects buttom
      scope.table[box.y - i][box.x].selected = true;
    }else if(!bBlocked &&(box.y - i)>=0 && scope.table[box.y-i][box.x ]!= undefined && scope.table[box.y-i][box.x ].piece != undefined){
      bBlocked = true;
    }
  }
}

function showBishopMoves(box, scope) {
  var rtBlocked= false, rbBlocked= false, ltBlocked= false, lbBlocked = false;
  for (var i = 1; i < 8; i++) {
        if (!rtBlocked && (box.y + i) < 8 && (box.x + i) < 8 && scope.table[box.y + i][box.x + i]!= undefined && scope.table[box.y + i][box.x + i].piece === undefined) { //Right top diagonal
          scope.table[box.y + i][box.x + i].selected = true;
        }else if(!rtBlocked &&(box.y + i) < 8 && (box.x + i) < 8 && scope.table[box.y + i][box.x + i]!= undefined && scope.table[box.y + i][box.x + i].piece != undefined && scope.table[box.y + i][box.x + i].piece!=box.piece){//Block the way if there is a piece
          rtBlocked=true;
        }
        if (!rbBlocked && (box.y - i) >=0 && (box.x + i) < 8 && scope.table[box.y - i][box.x + i]!= undefined && scope.table[box.y - i][box.x + i].piece === undefined ) { //Right button diagonal
          scope.table[box.y - i][box.x + i].selected = true;
        }else if(!rbBlocked && (box.y - i) < 8 && (box.x + i) < 8 && scope.table[box.y - i][box.x + i]!= undefined && scope.table[box.y - i][box.x + i].piece != undefined){//Block the way if there is a piece
          rbBlocked=true;
        }
        if (!ltBlocked && (box.y + i) < 8 && (box.x - i) >=0 && scope.table[box.y + i][box.x - i]!= undefined && scope.table[box.y + i][box.x - i].piece === undefined) { //Left top diagonal
          scope.table[box.y + i][box.x - i].selected = true;
        }else if(!ltBlocked &&(box.y + i) < 8 && (box.x - i) < 8 && scope.table[box.y + i][box.x - i]!= undefined && scope.table[box.y + i][box.x - i].piece != undefined){//Block the way if there is a piece
          ltBlocked=true;
        }
        if (!lbBlocked && (box.y - i) >= 0 && (box.x - i) >= 0 && scope.table[box.y - i][box.x - i]!= undefined && scope.table[box.y - i][box.x - i].piece === undefined) { //Left button diagonal
          scope.table[box.y - i][box.x - i].selected = true;
        }else if(!lbBlocked &&(box.y - i) < 8 && (box.x - i) < 8 && scope.table[box.y - i][box.x - i]!= undefined && scope.table[box.y - i][box.x - i].piece != undefined){//Block the way if there is a piece
          lbBlocked=true;
        }
  }
}

function showHorseMoves(box, scope) {

    //TODO: ARREglar comentarios

    if (scope.table[box.y + 1][box.x - 2]!= undefined && scope.table[box.y +1][box.x - 2].piece === undefined) { //Left top  L
      scope.table[box.y +1][box.x - 2].selected = true;
    }
    if (scope.table[box.y + 1][box.x + 2]!= undefined && scope.table[box.y + 1][box.x + 2].piece === undefined) { //Right top L
      scope.table[box.y + 1][box.x + 2].selected = true;
    }
    if (scope.table[box.y - 1][box.x - 2]!= undefined && scope.table[box.y - 1][box.x - 2].piece === undefined) { //left bottom L
      scope.table[box.y -1][box.x - 2].selected = true;
    }
    if ( scope.table[box.y - 1][box.x + 2]!= undefined && scope.table[box.y - 1][box.x + 2].piece === undefined) { //Right bottom L
      scope.table[box.y - 1][box.x + 2].selected = true;
    }
    if (scope.table[box.y + 2][box.x - 1]!= undefined && scope.table[box.y +2][box.x - 1].piece === undefined) { //Left top L
      scope.table[box.y +2][box.x - 1].selected = true;
    }
    if (scope.table[box.y + 2][box.x + 1]!= undefined && scope.table[box.y + 2][box.x + 1].piece === undefined) { //Right top L
      scope.table[box.y + 2][box.x + 1].selected = true;
    }
    if (scope.table[box.y - 2][box.x - 1]!= undefined && scope.table[box.y - 2][box.x - 1].piece === undefined) { //left bottom L
      scope.table[box.y -2][box.x - 1].selected = true;
    }
    if ( scope.table[box.y - 2][box.x + 1]!= undefined && scope.table[box.y - 2][box.x + 1].piece === undefined) { //Right bottom L
      scope.table[box.y - 2][box.x + 1].selected = true;
    }
}

/**
 * Putting pieces 
 */

function putPiece(i, j) {
  var box = new Object();
  box.x = j;
  box.y = i;

  /**
   * initaiate peons
   */
  if (j == 1) {
    box.piece = {
      type: "peon",
      color: "black",
      x: j,
      y: i,
      firstMove: true,
      dead: false
    };
  } else if (j == 6) {
    box.piece = {
      type: "peon",
      color: "white",
      x: j,
      y: i,
      firstMove: true,
      dead: false
    };
  }
  //Initiate towers
  else if (j === 0 && i === 0 || j === 0 & i === 7) {
    box.piece = {
      type: "tower",
      color: "black",
      x: j,
      y: i,
      dead: false
    };
  } else if (j === 7 && i === 0 || j === 7 & i === 7) {
    box.piece = {
      type: "tower",
      color: "white",
      x: j,
      y: i,
      dead: false
    };
  }
  //Initiate horses
  else if (j === 0 && i === 1 || j === 0 & i === 6) {
    box.piece = {
      type: "horse",
      color: "black",
      x: j,
      y: i,
      dead: false
    };
  } else if (j === 7 && i === 1 || j === 7 & i === 6) {
    box.piece = {
      type: "horse",
      color: "white",
      x: j,
      y: i,
      dead: false
    };
  }
  //Initiate bishops
  else if (j === 0 && i === 2 || j === 0 & i === 5) {
    box.piece = {
      type: "bishop",
      color: "black",
      x: j,
      y: i,
      dead: false
    };
  } else if (j === 7 && i === 2 || j === 7 & i === 5) {
    box.piece = {
      type: "bishop",
      color: "white",
      x: j,
      y: i,
      dead: false
    };
  }
  //Initiate king and queen black
  else if (j === 0 && i === 3) {
    box.piece = {
      type: "king",
      color: "black",
      x: j,
      y: i,
      dead: false
    };
  } else if (j === 0 && i === 4) {
    box.piece = {
      type: "queen",
      color: "black",
      x: j,
      y: i,
      dead: false
    };
  }
  //Initiate king and queen white
  else if (j === 7 && i === 3) {
    box.piece = {
      type: "king",
      color: "white",
      x: j,
      y: i,
      dead: false
    };
  } else if (j === 7 && i === 4) {
    box.piece = {
      type: "queen",
      color: "white",
      x: j,
      y: i,
      dead: false
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
    }
  }
}