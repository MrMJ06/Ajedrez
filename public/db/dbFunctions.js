function initiateDBFunctions(scope, http, window) {

    /**
     * Saving game
     */
    scope.save = function () {
      setTimeout(function () {
        scope.game.canvasUrl = window.canvasUrl;
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
      }, 2000);
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
  