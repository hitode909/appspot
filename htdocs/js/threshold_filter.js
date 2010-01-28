timer = null;
function log(text) {
    document.querySelector("#log").innerHTML+= (new Date()) + ": " + text + "\n";
}

function loadImage() {
    var path = document.querySelector("form").url.value;
    if (path.length  == 0) {
        log("path is invalid");
        return false;
    }
    log("image: " + path);
    var threshold = document.querySelector("form").threshold.value;
    if (typeof(threshold) == "undefined") {
        log("threshold is invalid");
        return false;
    }
    log("threshold: " + threshold);
    var canvas = document.querySelector("canvas");
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 3000, 3000);
    var img = new Image();
    img.src = "http://hitode909.appspot.com/proxy/" + path;
    img.onload = function() {
        log("image loaded");
        ctx.drawImage(img, 0, 0);
        var y = 0;
        log("start filtering");
        clearInterval(timer);
        timer = setInterval(function() {
            for(var x = 0; x < canvas.width; x+=1) {
                var data = ctx.getImageData(x,y,1,1).data;
                var sum = 0;
                for(var i = 0; i<data.length; i++) {
                    sum += data[i];
                }
                data = sum > threshold ? [255,255,255] :[0,0,0];
                ctx.fillStyle = "rgb(" + data.join(",") + ")";
                ctx.fillRect(x,y,1,1);
            }
            y+= 1;
            if (y >= canvas.height) {
                log("end filtering");
                clearInterval(timer);
            }
        }, 0);
    };
    return true;
};

loadImage();