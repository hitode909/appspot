// require jQuery

var SameImageUtil = function(option) {
    var threshold = 20;
    var cache = { };
    var getSimilarityObImages = function(img_a, img_b) {
        var a = getBinaryFromImage(img_a);
        var b = getBinaryFromImage(img_b);
        var len = a.length > b.length ? a.length : b.length;
        var diff = 0;
            
        for(var i = 0; i < len; i++) {
            diff += Math.abs(String.charCodeAt(a[i]) - String.charCodeAt(b[i]));
        }
        return diff * 1.0 / len;
    }
    var isSameImageObject = function(img_a, img_b) {
        return getSimilarityObImages(img_a, img_b) < threshold;
    };
    var getBinaryFromImage = function(img) {
        var size = 16;
        var canvas = $('<canvas width="' + size + '" height="' + size + '">')[0];
        var ctx = canvas.getContext("2d");
        ctx.scale(size / img.width, size / img.height);
        ctx.drawImage(img, 0, 0);
        return Array.map(ctx.getImageData(0, 0, size, size).data, function(i) {
            return String.fromCharCode(i);
        }).join('');
    }
    var getDataUrlFromUrl = function(url, callback) {
        if (cache[url]) {
            callback(cache[url]);
            return;
        }

        $.ajax({
            url:"http://to-data-uri.appspot.com/",
            dataType: "jsonp",
            data:{url: url},
            success:function(data) {
                cache[url] = data;
                callback(data);
            }
        });
    }

    var whenSameImage = function(urls, whenTrue, whenFalse) {
        if (!(urls.length >= 2)) throw("urls.length.should >= 2");

        var results = [];
        var similarity = 0.0;
        urls.forEach(function(url) {
            getDataUrlFromUrl(url, function(data) {
                var img = new Image();
                img.src = data.result;
                results.push(img);
                if (results.length < urls.length) return;
                setTimeout(function() {
                    for(var l = 0; l < results.length - 1; l++) {
                            for(var r = 1; r < results.length; r++) {
                                similarity = getSimilarityObImages(results[l], results[r]);
                                if (similarity > threshold) {
                                    whenFalse && whenFalse(urls, similarity);
                                    return;
                                }
                            }
                    }
                    whenTrue(urls, similarity);
                }, 0);
            });
        });
    };

    return {
        whenSameImage: whenSameImage
    }
}();
