var setup;
setup = function() {
  var add_pop, bind_events, get_image, new_shop_item, search_and_append, setup_pop, setup_search;
  bind_events = function() {
    ($(document).find('.shop-item')).draggable({
      handle: '.shop-image'
    });
    return ($(document).find('.delete')).click(function() {
      return $(this).parents('.shop-item').hide();
    });
  };
  new_shop_item = function(image_url, title) {
    var shop_item, template;
    template = _.template($('#shop-item-template').text());
    shop_item = $(template({
      image_url: image_url,
      title: title
    }));
    $('.items').append(shop_item);
    shop_item.css({
      left: Math.random() * 300,
      top: Math.random() * 300
    });
    return bind_events();
  };
  get_image = function(word) {
    var dfd, search;
    dfd = $.Deferred();
    search = new google.search.SearchControl();
    search.setResultSetSize(google.search.Search.LARGE_RESULTSET);
    search.addSearcher(new google.search.ImageSearch);
    search.setSearchCompleteCallback(this, function(sc, searcher) {
      return dfd.resolve(searcher.results);
    });
    search.draw();
    search.execute(word);
    return dfd.promise();
  };
  search_and_append = function(word) {
    var dfd;
    dfd = $.Deferred();
    get_image(word).then(function(res) {
      var item, _i, _len;
      for (_i = 0, _len = res.length; _i < _len; _i++) {
        item = res[_i];
        new_shop_item(item.tbUrl, item.contentNoFormatting);
      }
      return dfd.resolve();
    });
    return dfd.promise();
  };
  setup_search = function() {
    return $(document).find("button.search").click(function() {
      var query;
      query = $(document).find("input.search").val();
      if (!query) {
        return;
      }
      return search_and_append(query);
    });
  };
  setup_search();
  add_pop = function(word) {
    var pop;
    pop = $('<span>').addClass('pop').text(word).appendTo($('.items')).css({
      left: Math.random() * 300,
      top: Math.random() * 300
    });
    return pop.draggable();
  };
  setup_pop = function() {
    return $('button.add-pop').click(function() {
      return add_pop($('.pop-input').val());
    });
  };
  return setup_pop();
};
google.load("search", "1");
google.setOnLoadCallback(function() {
  return setup();
});