$.extend({
    photos: {},
    log: function(message) {
        console.log(message);
    },
    loadAlbum: function() {
        $.get($.apiPath(), function(res) {
            if (!res) return;
            $.each(res.split("\n"), function() {
                $.loadPhoto(this);
            });
        });
    },
    loadPhoto: function(url) {
        if ($.photos[url]) return false;
        var photo = $.appendPhoto(url);
        photo.data('url', url);
        $.photos[url] = photo;
        return true;
    },
    appendPhoto: function(url) {
        var img = $('<span>').addClass('photo').append(
            $('<a>').attr({href: url, rel: 'lightbox'}).append(
                $('<img>').attr('src', $.thumbnailPath(url))
            )
        );
        $('#album').append(img);
        $('a[rel=lightbox]').lightBox({
            imageLoading:  '/jquery-lightbox-0.5/images/lightbox-ico-loading.gif',
            imageLoading:  '/jquery-lightbox-0.5/images/lightbox-ico-loading.gif',
            imageBtnPrev:  '/jquery-lightbox-0.5/images/lightbox-btn-prev.gif',
            imageBtnNext:  '/jquery-lightbox-0.5/images/lightbox-btn-next.gif',
            imageBtnClose: '/jquery-lightbox-0.5/images/lightbox-btn-close.gif',
            imageBlank:    '/jquery-lightbox-0.5/images/lightbox-blank.gif'
        });
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
    thumbnailPath: function(url, size) {
        return 'http://hitode909.appspot.com/album/preview?size=' + (size || 120) + '&url=' + url;  
    }
});

$(function() {
    $.loadAlbum();
    $('form#post-photo').submit(function() {
        var url = $('input[name=photo_url]', this).attr('value');
        $.postPhoto(url);
        return false;
    });
    $('input[name=photo_url]').focus(function(){
        $(this).select();
    });
});
