$(function() {
    try {
        var canvasSize = 200;
        function plotLine(data, color) {
            var ctx = $('canvas')[0].getContext('2d');
            var width = canvasSize;
            var height = canvasSize;

            var yAt = function(v) {
                return (1.0 + v) * height / 2.0
            }

            ctx.beginPath();
            ctx.strokeStyle = color;

            var len = width < data.length ? width : data.length;
            var from = 0;
            var rate = canvasSize / historyMax;
            for(var x = from; x < len; x++) {
                if (x == from) {
                    ctx.moveTo(x * rate, yAt(data[x]));
                } else {
                    ctx.lineTo(x * rate, yAt(data[x]));
                }
            }
            ctx.stroke();
        }

        function clearCanvas() {
            var canvas = $('canvas')[0];
            var width = canvasSize;
            var height = canvasSize;
            $(canvas).attr({ width: canvasSize, height: canvasSize });
            var ctx = $('canvas')[0].getContext('2d');
            ctx.clearRect(0, 0, canvasSize, canvasSize);
        }

        function colorFor(axis) {
            if (axis == 'x') return 'RED';
            if (axis == 'y') return 'GREEN';
            if (axis == 'z') return 'BLUE';
        }

        var history = {
            x: [0],
            y: [0],
            z: [0]
        };

        var shaking = {
            x: false,
            y: false,
            z: false
        }
        var historyMax = 100;
        var lowPass = { x: 0, y: 0, z: 0 };
        var threshold = historyMax * 0.05;
        var postTimer = null;
        var posting = false;


        function postTwitter(text) {
            $('form input').attr('value', text);
            $('form').submit();
        }
        window.addEventListener("MozOrientation", function(data) {
            clearCanvas();
            ['x', 'y', 'z'].forEach(function(axis) {
                lowPass[axis] = lowPass[axis] * 0.8 + data[axis] * 0.2;
                history[axis].push(lowPass[axis] - data[axis]);
                plotLine(history[axis], colorFor(axis));

                var sum = 0.0;
                history[axis].forEach(function(v){
                    sum += Math.abs(v);
                });

                if (sum > threshold && !shaking[axis]){
                    $('#' + axis).css('color', colorFor(axis));
                    if (!posting) {
                        if (postTimer) clearTimeout(postTimer);
                        posting = true;
                        $("#loading").show();
                        postTimer = setTimeout(function() {
                            $.post(
                                '/png/',
                                { data: $('canvas')[0].toDataURL()},
                                function(tiny) {
                                    setTimeout(function() {
                                        posting = false;
                                        $("#loading").hide();
                                    }, 5000);
                                    if (!tiny.match(/http/)) return;
                                    postTwitter('揺れてます ' + tiny);
                                }
                            );
                        }, 500);
                    }
                    shaking[axis] = true;
                }
                if (sum < threshold && shaking[axis]) {
                    $('#' + axis).css('color', 'black');
                    shaking[axis] = false;
                }
                $('#' + axis).text(axis + ': ' + sum);
            });
            if (history.x.length > historyMax) {
                ['x', 'y', 'z'].forEach(function(axis) {
                    history[axis].shift();
                });
            }

        }, true);

    } catch(e) {
        console.log(e)
    };
});