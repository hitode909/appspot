var samples = [
    [
        "BT0A0A7.WAV",
        "BT0A0D0.WAV",
        "BT0A0D3.WAV",
        "BT0A0DA.WAV",
        "BT0AAD0.WAV",
        "BT0AADA.WAV",
        "BT3A0D0.WAV",
        "BT3A0D3.WAV",
        "BT3A0D7.WAV",
        "BT3A0DA.WAV",
        "BT3AAD0.WAV",
        "BT3AADA.WAV",
        "BT7A0D0.WAV",
        "BT7A0D3.WAV",
        "BT7A0D7.WAV",
        "BT7A0DA.WAV",
        "BT7AAD0.WAV",
        "BT7AADA.WAV",
        "BTAA0D0.WAV",
        "BTAA0D3.WAV",
        "BTAA0D7.WAV",
        "BTAA0DA.WAV",
        "BTAAAD0.WAV",
        "BTAAADA.WAV"
    ],
    [
        "ST0T0S0.WAV",
        "ST0T0S3.WAV",
        "ST0T0S7.WAV",
        "ST0T0SA.WAV",
        "ST0T3S3.WAV",
        "ST0T3S7.WAV",
        "ST0T3SA.WAV",
        "ST0T7S3.WAV",
        "ST0T7S7.WAV",
        "ST0T7SA.WAV",
        "ST0TAS3.WAV",
        "ST0TAS7.WAV",
        "ST0TASA.WAV",
        "ST3T0S0.WAV",
        "ST3T0S3.WAV",
        "ST3T0S7.WAV",
        "ST3T0SA.WAV",
        "ST3T3S3.WAV",
        "ST3T3S7.WAV",
        "ST3T3SA.WAV",
        "ST3T7S3.WAV",
        "ST3T7S7.WAV",
        "ST3T7SA.WAV",
        "ST3TAS3.WAV",
        "ST3TAS7.WAV",
        "ST3TASA.WAV",
        "ST7T0S0.WAV",
        "ST7T0S3.WAV",
        "ST7T0S7.WAV",
        "ST7T0SA.WAV",
        "ST7T3S3.WAV",
        "ST7T3S7.WAV",
        "ST7T3SA.WAV",
        "ST7T7S3.WAV",
        "ST7T7S7.WAV",
        "ST7T7SA.WAV",
        "ST7TAS3.WAV",
        "ST7TAS7.WAV",
        "ST7TASA.WAV",
        "STAT0S0.WAV",
        "STAT0S3.WAV",
        "STAT0S7.WAV",
        "STAT0SA.WAV",
        "STAT3S3.WAV",
        "STAT3S7.WAV",
        "STAT3SA.WAV",
        "STAT7S3.WAV",
        "STAT7S7.WAV",
        "STAT7SA.WAV",
        "STATAS3.WAV",
        "STATAS7.WAV",
        "STATASA.WAV"
    ],
            [
        "LT0D0.WAV",
        "LT0D3.WAV",
        "LT0D7.WAV",
        "LT0DA.WAV",
        "LT3D0.WAV",
        "LT3D3.WAV",
        "LT3D7.WAV",
        "LT3DA.WAV",
        "LT7D0.WAV",
        "LT7D3.WAV",
        "LT7D7.WAV",
        "LT7DA.WAV",
        "LTAD0.WAV",
        "LTAD3.WAV",
        "LTAD7.WAV",
        "LTADA.WAV"
    ],
    [
        "MT0D0.WAV",
        "MT0D3.WAV",
        "MT0D7.WAV",
        "MT0DA.WAV",
        "MT3D0.WAV",
        "MT3D3.WAV",
        "MT3D7.WAV",
        "MT3DA.WAV",
        "MT7D0.WAV",
        "MT7D3.WAV",
        "MT7D7.WAV",
        "MT7DA.WAV",
        "MTAD0.WAV",
        "MTAD3.WAV",
        "MTAD7.WAV",
        "MTADA.WAV"
    ],
    [
        "HT0D0.WAV",
        "HT0D3.WAV",
        "HT0D7.WAV",
        "HT0DA.WAV",
        "HT3D0.WAV",
        "HT3D3.WAV",
        "HT3D7.WAV",
        "HT3DA.WAV",
        "HT7D0.WAV",
        "HT7D3.WAV",
        "HT7D7.WAV",
        "HT7DA.WAV",
        "HTAD0.WAV",
        "HTAD3.WAV",
        "HTAD7.WAV",
        "HTADA.WAV"
    ],
    [
        "RIM127.WAV",
        "RIM63.WAV"
    ],
    [
        "HANDCLP1.WAV",
        "HANDCLP2.WAV"
    ],
        [
        "HHCD0.WAV",
        "HHCD2.WAV",
        "HHCD4.WAV",
        "HHCD6.WAV",
        "HHCD8.WAV",
        "HHCDA.WAV",
        "HHOD0.WAV",
        "HHOD2.WAV",
        "HHOD4.WAV",
        "HHOD6.WAV",
        "HHOD8.WAV",
        "HHODA.WAV",
        "CLOP1.WAV",
        "CLOP2.WAV",
        "CLOP3.WAV",
        "CLOP4.WAV",
        "OPCL1.WAV",
        "OPCL2.WAV",
        "OPCL3.WAV",
        "OPCL4.WAV"
    ],
    [
        "RIDED0.WAV",
        "RIDED2.WAV",
        "RIDED4.WAV",
        "RIDED6.WAV",
        "RIDED8.WAV",
        "RIDEDA.WAV",
    ],
    [
        "CSHD0.WAV",
        "CSHD2.WAV",
        "CSHD4.WAV",
        "CSHD6.WAV",
        "CSHD8.WAV",
        "CSHDA.WAV"
    ]
];

$.extend({
    newLine: function(srces) {
        var line = $("<div>");
        line.attr({className: "line"});
        var select = $("<select>");
        var index_select = Math.floor(srces.length * 0.3);
        $.each(srces, function(index) {
            var option = $("<option>");
            option.text("" + this);
            if (index == index_select) option.attr({selected: true});
            option.attr({value: "TR909all/" + this});
            select.append(option);
        });
        line.append(select);
        $.each("0123456789ABCDEF".split(""), function() {
            var input = $("<input>");
            input.attr({ type: "checkbox", value: this});
            line.append(input);
        });

        var bar = $("<input>");
        bar.attr({className: "volume", type: "range", min: 0, max: 100, value: 70 });
        bar.css({ width: "8em"});
        line.append(bar);
        $(".lines").append(line);
        line.setupLine();
    }
});

$.fn.extend({
    playAudio: function(volume) {
        var element = this[0];
        element.volume = volume;
        element.play();
        element.currentTime = 0;
    },
    setupLine: function() {
        var audio = $("<audio>");
        audio.attr("src", $(this).find("select").val());
        $("body").append(audio);

        var volumeInput = $(this).find(".volume");

        var buttons = $(this).find("input");
        var self = this;
        $(".lines").bind("tick", function(event, step) {
            var src = $(self).find("select").val();
            if (audio.attr("src") != src) {
                audio.remove();
                audio = $("<audio>");
                audio.attr({ src: src});
                $("body").append(audio);
            }

            var current = buttons.get(step);
            $(current).css({opacity: 0.1}).animate({opacity: 1.0}, 100);
            if (current.checked)
                audio.playAudio(volumeInput.val() / 100);
        });
    }
});

$(function() {
    $.each(samples, function() {
        $.newLine(this);
    });

    var getInterval = function(bpm) {
        return 60 * 1000 / bpm / 4;
    };

    var step = 0;
    var bpm = 120;
    var timer = setInterval(function() {
        $(".lines").trigger("tick", step);

        step++;
        if (step == 16) {
            step = 0;
        }

        var new_bpm = + $("#bpm").val();
        if (new_bpm > 0 && bpm != new_bpm) {
            clearInterval(timer);
            timer = setInterval(arguments.callee, getInterval(new_bpm));
            bpm = new_bpm;
        }
    }, getInterval(bpm));

});