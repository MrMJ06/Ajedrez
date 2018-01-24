var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {

  $scope.showCoordinates = function(piece){
    for(var i=0;i<8;i++){
      for(var j=0;j<8;j++){
        $scope.table[i][j].selected=false;
      }
    }
    piece.selected = !piece.selected;
  }

  $scope.table = init();

});

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);

    for (var i=0; i<total; i++) {
      input.push(i);
    }

    return input;
  };
});


/**
 * Functions
 */

 function init(){
  var table = new Array();
  for(var i=0;i<8;i++){
    var row = new Array();

    for(var j=0;j<8;j++){
      var box = new Object();
      box.x = j;
      box.y = i;
      if(j==1){
       box.piece = {type:"peon",color:"black",x:j,y:i,dead:false};
      }else if(j==6){
        box.piece = {type:"peon",color:"white",x:j,y:i,dead:false};
      }
      box.selected = false;

      row.push(box);
    }
    table.push(row);
  }
  return table;
 }
