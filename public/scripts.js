var html2canvas = require("html2canvas");

function screenshot() {
    window.alert("shot");
    html2canvas(document.getElementById("chessContainer")).then(function (canvas) {
            window.canvasUrl = canvas.toDataURL('image/png');
        }
    );
}
