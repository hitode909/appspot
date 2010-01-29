$.extend({
    photos: {},
    log: function(message) {
        console.log(message);
    },
    errorTimer: 0,
    error: function(e) {
        clearTimeout($.errorTimer);
        $('#error').text('Error: ' + e.responseText).show();
        $.errorTimer = setTimeout(function() {
            $('#error').hide('slow');
        }, 8000);
    },
    hideError: function() {
        clearTimeout($.errorTimer);
        $('#error').hide();
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
        var img = $('<li>').addClass('photo').append(
            $('<div>').addClass('picture').append(
                $('<a>').attr({href: url, rel: 'lightbox'}).append(
                    $('<img>').attr('src', $.thumbnailPath(url))
                )
            )
        ).append(
            $('<div>').addClass('detail').append(
                $('<a>').attr({href: url, target: '_blank' }).text($.fileName(url))
            )
        ).append(
            $('<div>').addClass('delete').append(
                $('<a>').attr({href: url, target: '_blank' }).text('delete')
            )
        );
        $('#album .photos').prepend(img);
        $('.delete a', img).click(function() {
            if(confirm('delete?')) {
                $.deletePhoto(url);
            }
        });
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
        $.hideError();
        $.ajax({
            type: 'delete',
            url: $.apiPath() + '?url=' + url,
            success: function() {
                $.photos[url] = null;
                elem.remove();
            },
            error: function(e) {
                $.error(e);
            }
        });
    },
    postPhoto: function(url, form) {
        $.hideError();
        $.ajax({
            type: 'post',
            url: $.apiPath(),
            data: {url: url},
            success: function() {
                $.loadPhoto(url);
            },
            error: function(e) {
                $.error(e);
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
        return 'http://hitode909.appspot.com/album/preview?size=' + (size || 150) + '&url=' + url;  
    },
    fileName: function(url) {
        var nodes = url.split('/');
        return nodes[nodes.length-1];
    }
});

$(function() {
    $.loadAlbum();
    $('form#post-photo').submit(function() {
        var url = $('input[name=url]', this).attr('value');
        $.postPhoto(url);
        return false;
    });
    $('input[name=url]').focus(function(){
        $(this).select();
    });
});
