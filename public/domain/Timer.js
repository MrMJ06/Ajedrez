class Timer{
    constructor(minutes, seconds){
        this.minutes = minutes;
        this.seconds = seconds;
        window.alert("Creado");
    }

     subSecond(scope){
        if(this.seconds==0 && this.minutes==0){
            scope.end=true;
            getWinner(scope);
        }else if(this.seconds==0){
            this.minutes=this.minutes-1;
            this.seconds=59;
        }else{
            this.seconds=this.seconds-1;
        }
    }
}



function getWinner(scope){
    if(scope.whiteScore>scope.blackScore){
        scope.turn = "white";
    }else if(scope.whiteScore<scope.blackScore){
        scope.turn="black"
    }else{
        if(scope.turn=="white"){
            scope.turn="black";
        }else{
            scope.turn="white"
        }
    }
}