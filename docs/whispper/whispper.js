var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(function() {
  var handle, show_login_or_logout;
  handle = function() {
    var lang, status;
    status = $(this).val();
    lang = $('html').attr('lang');
    $(this).val('');
    $('.speech-container').animate({
      opacity: 0.0
    });
    return $.ajax({
      url: '/tweet/',
      type: 'POST',
      dataType: 'json',
      data: {
        status: "" + status + " #whispper"
      },
      complete: __bind(function() {
        return $('.speech-container').animate({
          opacity: 1.0
        });
      }, this),
      success: function(res) {
        var element, link;
        element = $('<div>').addClass('status');
        link = $('<a>').text(res.text).attr({
          href: "http://twitter.com/#!/" + res.user.screen_name + "/status/" + res.id_str,
          target: "_blank"
        });
        element.append(link);
        return $('#results').prepend(element);
      },
      error: function(res, text, error) {
        var message;
        message = $('<div>').addClass('error').text(res.responseText);
        return $('#results').prepend(message);
      }
    });
  };
  $('#language-selector input').change(function() {
    return $('html').attr('lang', $(this).val());
  });
  $('input.speech').bind('speechchange', handle);
  $('input.speech').bind('webkitspeechchange', handle);
  show_login_or_logout = function() {
    return $.ajax({
      url: '/tweet/',
      type: 'GET',
      dataType: 'json',
      success: function(res) {
        if (res.user) {
          $('#logout').show();
          $('#login').hide();
          $('#screen_name').text(res.user.screen_name);
          return $('#main').show();
        } else {
          $('#login').show();
          return $('#logout').hide();
        }
      },
      error: function(res, text, error) {
        var message;
        message = $('<div>').addClass('error').text(res.responseText);
        return $('#results').prepend(message);
      }
    });
  };
  return show_login_or_logout();
});