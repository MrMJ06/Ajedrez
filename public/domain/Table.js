class Table {

    constructor() {}

    init() {
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

}

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