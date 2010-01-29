$.extend({
    photos: {},
    log: function(message) {
        console.log(message);
    },
    errorTimer: 0,
    error: function(e) {
        clearTimeout($.errorTimer);
        $('#error').hide().text('Error: ' + e.responseText).show('midiam');
        $.errorTimer = setTimeout(function() {
            $('#error').hide('slow');
        }, 4000);
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
        $('form').addClass('loading');
        $.ajax({
            type: 'delete',
            url: $.apiPath() + '?url=' + encodeURI(url),
            success: function() {
                $.photos[url] = null;
                elem.remove();
            },
            error: function(e) {
                $.error(e);
            },
            complete: function() {
                $('form').removeClass('loading');
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
                $('input[name=url]').attr('value', '');
                $.loadPhoto(url);
            },
            error: function(e) {
                $.error(e);
            },
            complete: function() {
                if (form) {
                    $(':input', form).attr('disabled', false);
                    $('form').removeClass('loading');
                }
            }
        });
        if (form) {
            $(':input', form).attr('disabled', true);
            $(form).addClass('loading');
        }
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
    },
    showPostBox: function() {
        $('.post-photo-box-button').hide(500);
        $('.post-photo-box').show(1000);
    }
});

$(function() {
    $.loadAlbum();
      $('.post-photo-box-button').click(function() {
          $.showPostBox();
          return false;
      });
    $('form#post-photo').submit(function() {
        var url = $('input[name=url]', this).attr('value');
        $.postPhoto(url, this);
        return false;
    });
    $('input[name=url]').focus(function(){
        $(this).select();
    });
    if ($('input[name=url]').attr('value')) {
        setTimeout($.showPostBox, 1000);
    }
});
