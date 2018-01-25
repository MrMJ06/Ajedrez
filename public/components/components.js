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
      var box = new Object();
      box.x = j;
      box.y = i;
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
      box.selected = false;

      row.push(box);
    }
    table.push(row);
  }
  return table;
}

function initiateFunctions(scope) {

  scope.selectBox = function (box) {
    var selectedBox;
    
    /**
     * Takes the selectedBox if exists
     */
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if(scope.table[i][j].selected && scope.table[i][j].piece!=undefined){
          selectedBox = scope.table[i][j];
        }
      }
    }
    
    if (selectedBox!=undefined && selectedBox.piece!=undefined && box!== selectedBox) {
     selectedBox.piece.firstMove = false;
     scope.table[box.y][box.x].piece = selectedBox.piece;
     scope.table[selectedBox.y][selectedBox.x].piece = undefined;
     clearTable(scope); 
    }else if(selectedBox===undefined){
      clearTable(scope);
      box.selected = !box.selected;
      if (box.piece.type == 'peon') {
        showPeonMoves(box, scope);
      }
    }else{
      clearTable(scope);
    }
  }
}

function showPeonMoves(box, scope) {
  if (box.piece.type == 'peon' && box.piece.color == 'black') {
    scope.table[box.y][box.x + 1].selected = true;
    if (box.piece.firstMove == true) {
      scope.table[box.y][box.x + 2].selected = true;
    }
  } else if (box.piece.type == 'peon' && box.piece.color == 'white') {
    scope.table[box.y][box.x - 1].selected = true;
    if (box.piece.firstMove == true) {
      scope.table[box.y][box.x - 2].selected = true;
    }
  }
}

function clearTable(scope){
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      scope.table[i][j].selected=false;
    }
  }
}