var html2canvas = require("html2canvas");

function screenshot() {
    html2canvas(document.getElementById("chessContainer")).then(function (canvas) {
            // window.canvasUrl = canvas.toDataURL('image/png');
            // window.alert(window.canvasUrl);
        }
    );
}
