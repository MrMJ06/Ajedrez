var app = angular.module('myApp', ['ngRoute', 'ui.router']);

app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
  //$locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('');

  $stateProvider.state('home', {
    url: '/home',
    controller: 'chessCtrl',
    templateUrl: '../home.html'
  }).state('create', {
    url: '/create',
    controller: 'chessCtrl',
    templateUrl: '../create.html'
  }).state('chess', {
    url: '/chess',
    controller: 'chessCtrl',
    templateUrl: '../chess.html'
  });

  $urlRouterProvider.otherwise('/home');

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


app.controller('chessCtrl', function ($rootScope, $scope, $interval, $http, $location, $window, data) {
  configGame($scope, $interval, data);
  peerConfiguration($scope, $window);
  initiateFunctions($scope.game, $location, $window, data);
  initiateDBFunctions($scope, $http, $window);

});


/**
 * Game congiguration
 */

function configGame(scope, interval, data) {

  scope.game = {};
  scope.game.chat = new Array();
  scope.gameData = data.get();
  scope.game.started = false;

  scope.game.table = init(); //Put the pieces in the game
  scope.game.turn = getFirstTurn(); //Selects a color to iniciate the game  $scope.game.blackScore = 0;

  scope.game.end = false; //True if the game finish
  scope.game.blackScore = 0;
  scope.game.whiteScore = 0;

  //Timer configuration
  if (scope.gameData.time != undefined) {
    scope.game.blackTimer = new Timer(scope.gameData.time, 0);
    scope.game.whiteTimer = new Timer(scope.gameData.time, 0);

    interval(function () {
      if (scope.game.blackTimer != undefined && scope.game.started != undefined && (scope.game.started || scope.game.color==undefined)) {
        if (scope.game.turn == "black" && !scope.game.end) {
          scope.game.blackTimer.subSecond(scope.game);
        } else if (!scope.game.end) {
          scope.game.whiteTimer.subSecond(scope.game);
        }
      }
    }, 1000);
  }
}