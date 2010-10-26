$(function() {
    var drum = new DrumSet();
    console.log(drum);
    // drum.register('div'  , '/tr909/TR909all/BT7AAD0.WAV');
    // drum.register('span' , '/tr909/TR909all/ST0T7S7.WAV');

    $('button.drum').click(function() {
        var part = $(this).attr('name');
        drum.play(part);
    });

    var hash = function(string, max) {
        var sum = 0;
        for(var i = 0; i < string.length; i++) {
            sum += string.charCodeAt(i);
        }
        return sum % max;
    }

    var current = null;
    setInterval(function() {
        if (!current) current = document.querySelector('#drum-root').children[0];
        var tagName = current.tagName.toLowerCase();
        drum.register(tagName, '/tr909/TR909all/' + drum.samples[hash(tagName, drum.samples.length)]);
        drum.play(tagName);
        (function(tag) {
            $(tag).css({opacity: 0.0}).animate({opacity: 1.0}, 100);
        })(current);
        current = current.children[0];
    }, 200);


    $('#apply').click(function() {
        $('#drum-root').html($('#editor').val());
    });
});





