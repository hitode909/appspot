var Controller = function(presentation) {
    var prev = function() {
        presentation.prev();
    };
    var next = function() {
        presentation.next();
    };
    $(window).keypress(function(event) {
        if (!event.target.tagName.toLowerCase().match(/^(html|body)$/)) return;
        switch(event.keyCode || event.charCode) {
        case 37:
        case 38:
        case 107:
            // left, up, k
            prev();
            return false;
        case 39:
        case 40:
        case 106:
            // right, down, j
            next();
            return false;
        default:
            return true;
        }
    });
    $('body').click(function(event) {
        if (!event.target.tagName.toLowerCase().match(/^(div|body)$/)) return;

        next();
    });

    return 'ok';
};

var GoogleSearchPresentation =  function(container) {
    if (!container) {
        container = $('<div>');
        $('body').append(container);
    }
    var view = SlideViewer(container);

    var search = new google.search.SearchControl();
    search.setResultSetSize(google.search.Search.LARGE_RESULTSET);
    search.addSearcher(new google.search.ImageSearch());

    search.setSearchCompleteCallback(this, function(sc, searcher) {
        $.each(searcher.results, function(index, result) {
            var a = $('<a>').attr({href: result.originalContextUrl, target: '_blank'});
            var img = $('<img>').attr({src: result.url, title: result.titleNoFormatting});
            a.append(img);
            view.pushImageAsync(a);
        });
    });
    search.draw();

    var currentSlide = 0;
    var slides = ['foo', 'bar', 'popopo'];

    var hasNext = function() {
        return currentSlide < slides.length;
    }

    var next = function() {
        if (view.hasNext()) {
            view.next();
            return;
        }
        if (!hasNext()) return;
        var query = slides[currentSlide];
        currentSlide++;
        if (!query) return;
        var element = $('<a>').attr({href: 'http://google.com/search?q=' + encodeURIComponent(query), target: '_blank'});
        element.append($('<h1>').text(query));
        view.pushTitle(element);
        search.execute(query);
        return true;
    }
    var prev = function() {
        if (view.hasPrev()) {
            view.prev();
        }
    }

    var setSlides = function(new_slides) {
        slides = new_slides;
    }

    return {
        setSlides: setSlides,
        slides: slides,
        prev: prev,
        next: next,
    };
}

var SlideViewer = function(container) {
    if (!container) {
        throw('no container element');
    }
    var slideIndex = -1;        // current viewing slide index
    var slides = [];            // array of element
    var slide;                  // current element pointer
    var newSlide = function() {
        slide = $('<div class="slide">');
        slides.push(slide);
        slideIndex = slides.length - 1;
        container.append(slide);
    };
    var show = function(element, target_slide) {
        if (!target_slide) {
            target_slide = slide;
        }
        var box = $('<div class="box">').append(element);
        $('img', box).css({opacity: 0});

        var new_one = $('<div>').append(box);
        target_slide.append(new_one).masonry({
            appendedContent: target_slide.attr('class').match('masoned') ? new_one : undefined,
            columnWidth: 110,
            itemSelector: '.box'
        }, function() {
            $('img', box).animate({
                opacity: 1
            }, 1000);
        });
    };
    var scroll = function() {
        $.scrollTo(slide, 300);
    }
    var pushTitle = function(element) {
        newSlide();
        show(element);
        scroll();
    };
    var pushElement = function(element) {
        show(element);
    };
    var pushImageAsync = function(element) {
        var current_slide = slide[0];
        $('img', element).bind('load', function() {
            show(element, $(current_slide));
        });
    };
    var hasNext = function() {
        return slideIndex + 1 < slides.length;
    };
    var hasPrev = function() {
        return slideIndex > 0;
    };
    var next = function() {
        if (!hasNext()) return;
        slideIndex++;
        slide = slides[slideIndex];
        scroll();
    };
    var prev = function() {
        if (!hasPrev()) return;
        slideIndex--;
        slide = slides[slideIndex];
        scroll();
    };
    return {
        pushTitle: pushTitle,
        pushlement: pushElement,
        pushImageAsync: pushImageAsync,
        next: next,
        prev: prev,
        hasNext: hasNext,
        hasPrev: hasPrev
    };
}

google.load("search", "1");
google.setOnLoadCallback(function() {
    google.search.Search.getBranding($("#branding")[0]);

    $("form#edit").submit(function() {
        location.href = '?keywords=' + $("textarea").val().split("\n").map(function(keyword) { return encodeURIComponent(keyword) }).join(",");
        return false;
    });

    var shorten = function(url, callback) {
        var api_key = 'R_adf8860abea0b952c6ef319757062e63';
        var login = 'hitode909';
        $.ajax({
            type: "GET",
            url: "http://api.bit.ly/v3/shorten",
            data: {
                login: login,
                apiKey: api_key,
                longUrl: url,
            },
            dataType: "jsonp",
            success: function(res) {
                callback(res);
                /*
                  {
                      "status_code": 200,
                      "data": {
                          "url": "http://bit.ly/cmeH01",
                          "hash": "cmeH01",
                          "global_hash": "1YKMfY",
                          "long_url": "http://betaworks.com/",
                          "new_hash": 0
                      },
                      "status_txt": "OK"
                  }
                 */
            }
        });
    };

    var query = function() {
        var table = {  };
        var sliced = location.search.replace(/\?/, '').split('=');
        while (sliced.length) {
            table[sliced.shift()] = sliced.shift();
        }
        return table;
    }

    if (!query().keywords) {
        $("#padding").hide("slow");
        return;
    }
    var keywords = query().keywords.split(',').map(function(keyword) { return decodeURIComponent(keyword) });
    $("title").text([keywords[0], $("title").text()].join(" - "));

    $("textarea").val(keywords.join("\n"));

    var presentation = GoogleSearchPresentation($('#slides'));
    presentation.setSlides(keywords);

    var controller = Controller(presentation);
    presentation.next();        // first slide


});
