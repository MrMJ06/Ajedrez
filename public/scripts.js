var html2canvas = require("html2canvas");

function screenshot() {
    window.alert("shot");
    html2canvas(document.body, {
        onrendered: function (canvas) {
            window.alert(canvas.toDataURL('image/png'));
            document.body.appendChild(canvas.toDataURL('image/png'));
        }
    });
}