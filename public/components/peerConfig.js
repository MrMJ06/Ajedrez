
function peerConfiguration(scope, window) {
    
    var masterConnection; //Connection to the master friend->master
    var friendConnection; //Connection to the frien master->friend
    scope.game.master = true; //Represents that you are the own of your game
    
    var peers = new Array();
    var peer = new Peer(peerIdGenerator(), {host: 'localhost', port: 8080, path: '/peer'});
    
    //Instantiate your peer
    peer.on('open', function (id) {
      scope.$apply( function(){
        scope.ownPeerId = id;
        peers.push(id);
      });
    });
  
    //Connect to anothe peer
    scope.connectPeer = function (id) {
      if (!contains(peers, id)) {
        masterConnection = peer.connect('' + id);
        peers.push(id);
        scope.game.turn = "white"; //The first turn is always white
        scope.game.master = false;
        scope.game.started = false;
      }
    };
  
    //The master starts the game
    scope.startGame = function () {
      var color = getFirstTurn();
  
      scope.game.color = color; //Set your color in the game
      scope.game.turn = "white";

      scope.game.table = init(scope);
      var startInfo = {};
      if (scope.game.master) {
        startInfo.type = 'startInfo';
        startInfo.started = true;
        startInfo.color = getNextTurn(color); //Set the complementary color to your friend
        friendConnection.send(startInfo);
        scope.game.started = true;
      }
    };
  
  
    //Move a piece
    scope.game.sendMove = function (box, selectedPiece) {
      var data = {};
  
      data.type = "move";
      //origin
      data.oy = selectedPiece.y;
      data.ox = 7 - selectedPiece.x;
      //destiny
      data.dy = box.y;
      data.dx = 7 - box.x;
      if (scope.game.master) {
        friendConnection.send(data);
      } else {
        masterConnection.send(data);
      }
    };
  
    //Receive a connection
    peer.on('connection', function (conn) {
      window.alert('connected');
      window.alert(conn.peer);
      if (!contains(peers, conn.peer)) {
        friendConnection = peer.connect('' + conn.peer);
      }
      peers.push(conn.peer);
  
      //Close the connection
      conn.on('close', function (data) {
        window.alert(conn.peer + " left");
  
        peers.slice(peers.indexOf(conn.peer), 1); //Removd the pper of the list
        scope.game.started = false; //Stops the game
      });
  
      //Receives data from the opponent
      conn.on('data', function (data) {
        if (data.type == "table") {
          scope.game = data;
        } else if (data.type == "move") { //The opponent want to move a piece
          movePiece(scope, data);
        } else if (data.type == "startInfo") { //The master starts the game
          setInitialValues(scope, data);
        }
      });
    });
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

function peerIdGenerator(){
  var res = "";
  var alphabet = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWYZ_-";

  for(var i=0; i<10;i++){
    res+=alphabet.charAt(Math.floor(alphabet.length*Math.random()));
  }

  return res;
}