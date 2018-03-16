var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  //$locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('');

  $routeProvider.when('/', {
    controller: 'myCtrl',
    templateUrl: '../home.html'
  }).when('/create', {
    controller: 'myCtrl',
    templateUrl: '../create.html'
  }).when('/chess', {
    controller: 'myCtrl',
    templateUrl: '../chess.html'
  });

});

app.factory("data", function () {
  var storage = {};
  return {
    get: function () {
      return storage;
    },
    set: function (toSet) {
      storage = toSet;
      return storage;
    }
  };
});


app.controller('myCtrl', function ($rootScope, $scope, $interval, $http, $location, data) {

  $scope.game = {};
  $scope.gameData = data.get();

  initiateFunctions($scope.game, $location, data);
  initiateDBFunctions($scope, $http);
  $scope.game.table = init();
  $scope.game.turn = getFirstTurn(); //Selects a color to iniciate the game  $scope.game.blackScore = 0;

  $scope.game.end = false;
  $scope.game.blackScore = 0;
  $scope.game.whiteScore = 0;
  //window.alert(JSON.stringify($scope.data, null, 4));

  if ($scope.gameData.time != undefined) {
    $scope.game.blackTimer = new Timer($scope.gameData.time, 0);
    $scope.game.whiteTimer = new Timer($scope.gameData.time, 0);

    $interval(function () {
      if ($scope.game.blackTimer != undefined) {
        if ($scope.game.turn == "black" && !$scope.game.end) {
          $scope.game.blackTimer.subSecond($scope.game);
        } else if (!$scope.game.end) {
          $scope.game.whiteTimer.subSecond($scope.game);
        }
      }
    }, 1000);
  }
});


/**
 * Functions
 */

function init() {
  var table = [];
  for (var i = 0; i < 8; i++) {
    var row = [];
    for (var j = 0; j < 8; j++) {
      row.push(putPiece(i, j)); //add the pieces
    }
    table.push(row);
  }
  return table;
}

function initiateFunctions(scope, location, data) {

  scope.saveGame = function () {
    data.set({title: scope.title, time: scope.time});
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
    if (selectedPiece != undefined && selectedPiece.piece != undefined && box !== selectedPiece && scope.turn == selectedPiece.piece.color && !scope.end) {

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

function initiateDBFunctions(scope, http) {

  /**
   * Saving game
   */
  scope.save = function () {
    scope.game.moment = new Date();
    http({
      method: 'POST',
      url: 'http://localhost:3000/save',
      data: scope.game,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json'
    }).success(function (response) {
      window.alert(JSON.stringify(response, null, 4));
    }).error(function (response) {
      window.alert("Error: " + JSON.stringify(response, null, 4));
    });
  };

  /**
   * Saving game
   */
  scope.getGames = function () {
    http({
      method: 'GET',
      url: 'http://localhost:3000/findAll',
    }).then(function (response) {
      window.alert(JSON.stringify(response.data, null, 4));
      scope.gameList = response.data;
    }, function (response) {
      window.alert("Error: " + JSON.stringify(response, null, 4));
    });
  };
}

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

/**
 * Putting pieces 
 */
//TODO: implement revert move
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
      threatened: false,

    };
  } else if (j == 6) {
    box.piece = {
      type: "peon",
      color: "white",
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
      color: "black",
      x: j,
      y: i,
      threatened: false
    };
  } else if (j === 7 && i === 0 || j === 7 & i === 7) {
    box.piece = {
      type: "tower",
      color: "white",
      x: j,
      y: i,
      threatened: false
    };
  }
  //Initiate horses
  else if (j === 0 && i === 1 || j === 0 & i === 6) {
    box.piece = {
      type: "horse",
      color: "black",
      x: j,
      y: i,
      threatened: false
    };
  } else if (j === 7 && i === 1 || j === 7 & i === 6) {
    box.piece = {
      type: "horse",
      color: "white",
      x: j,
      y: i,
      threatened: false
    };
  }
  //Initiate bishops
  else if (j === 0 && i === 2 || j === 0 & i === 5) {
    box.piece = {
      type: "bishop",
      color: "black",
      x: j,
      y: i,
      threatened: false
    };
  } else if (j === 7 && i === 2 || j === 7 & i === 5) {
    box.piece = {
      type: "bishop",
      color: "white",
      x: j,
      y: i,
      threatened: false
    };
  }
  //Initiate king and queen black
  else if (j === 0 && i === 3) {
    box.piece = {
      type: "king",
      color: "black",
      x: j,
      y: i,
      threatened: false
    };
  } else if (j === 0 && i === 4) {
    box.piece = {
      type: "queen",
      color: "black",
      x: j,
      y: i,
      threatened: false
    };
  }
  //Initiate king and queen white
  else if (j === 7 && i === 3) {
    box.piece = {
      type: "king",
      color: "white",
      x: j,
      y: i,
      threatened: false
    };
  } else if (j === 7 && i === 4) {
    box.piece = {
      type: "queen",
      color: "white",
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


function contains(collection, value) {
  var result = false;
  for (var i = 0; i < collection.length; i++) {
    if (collection[i] == value) {
      result = true;
      break;
    }
  }

  return result;
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