$.extend({
    photos: {},
    log: function(message) {
        console.log(message);
    },
    loadAlbum: function() {
        $.get($.apiPath(), function(res) {
            if (!res) return;
            $.each(res.split("\n"), function() {
                console.log(this);
                $.loadPhoto(this);
            });
        });
    },
    loadPhoto: function(url) {
        if ($.photos[url]) return false;
        var photo = $.appendPhoto(url);
        photo.data('url', url);
        $(photo).click(function() {
            if (confirm('really?')) {
                $.deletePhoto(url);
            }
        });
        $.photos[url] = photo;
        return true;
    },
    appendPhoto: function(url) {
        var img = $('<span>').addClass('photo').append(
            $('<img>').attr('src', $.thumbnailPath(url))
        );
        $('#album').append(img);
        return img;
    },
    deletePhoto: function(url) {
        var elem = $.photos[url];
        $.ajax({
            type: 'delete',
            url: $.apiPath() + '?photo_url=' + url,
            success: function() {
                $.photos[url] = null;
                elem.remove();
            },
            error: function(e) {
                $.log(e);
            }
        });
    },
    postPhoto: function(url, form) {
        $.ajax({
            type: 'post',
            url: $.apiPath(),
            data: {photo_url: url},
            success: function() {
                $.loadPhoto(url);
            },
            error: function(e) {
                $.log(e);
            },
            complete: function() {
                if (form) $(':input', form).attr('disabled', false);
            }
        });
        if (form) $(':input', form).attr('disabled', true);
        return false;
    },
    previewPhoto: function(url) {
    },
    apiPath: function() {
        return ['/album/', $.albumName, '/api'].join('');
    },
    thumbnailPath: function(url) {
        return url;  
    }
});

$(function() {
    $.loadAlbum();
    $('form#post-photo').submit(function() {
        var url = $('input[name=photo_url]', this).attr('value');
        $.postPhoto(url);
        return false;
    });
});
