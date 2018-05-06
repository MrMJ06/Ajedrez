function initiateDBFunctions(scope, http, window) {

    /**
     * Saving game
     */
    scope.save = function () {
        setTimeout(function () {
           // scope.game.canvasUrl = window.canvasUrl;
            scope.game.moment = new Date();
            http({
                method: 'POST',
                url: 'http://localhost:3000/save',
                data: scope.game,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                dataType: 'json'
            });
        }, 2000);
    };

    /**
     * Games
     */
    scope.getGames = function () {
        http({
            method: 'GET',
            url: 'http://localhost:3000/findAll',
        }).then(function (response) {
            scope.gameList = response.data;
        }, function (response) {
            window.alert("Error: " + JSON.stringify(response, null, 4));
        });
    };

     /**
     * FindOne
     */
    scope.getGames = function () {
        http({
            method: 'GET',
            url: 'http://localhost:3000/findOne?gameId='+scope.game.identifier
        }).then(function (response) {
            scope.gameList = response.data;
        }, function (response) {
            window.alert("Error: " + JSON.stringify(response, null, 4));
        });
    };
}