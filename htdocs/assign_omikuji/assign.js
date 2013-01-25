window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
$(function() {
  var $preview, animationLoop, currentUser, step, users;
  users = 'hitode909 nanto_vi nobuoka hakobe932 wakabatan'.split(' ');
  currentUser = null;
  $preview = $('#preview');
  if (location.hash) {
    users = (location.hash.replace(/^\#/, '')).split(',');
  }
  ($('#add-user')).click(function() {
    users.push(($('#add-user-name')).val());
    ($('#add-user-name')).val('');
    return location.hash = '#' + (users.concat([currentUser])).join(',');
  });
  ($('#reset-user')).click(function() {
    currentUser = null;
    users = [];
    return $preview.css({
      opacity: 0
    });
  });
  step = function() {
    if (currentUser) {
      users.push(currentUser);
    }
    currentUser = users.shift();
    if (!currentUser) {
      return;
    }
    $preview.css({
      opacity: 1
    });
    return $preview.attr({
      src: "http://cdn1.www.st-hatena.com/users/" + currentUser.slice(0, 2) + "/" + currentUser + "/profile.gif"
    });
  };
  animationLoop = function() {
    step();
    return window.requestAnimationFrame(animationLoop);
  };
  animationLoop();
  $preview.click(function() {
    ($('#names')).append(($('<div>')).text(currentUser));
    return alert(currentUser);
  });
  return ($('form')).submit(function() {
    ($('#add-user')).click();
    return false;
  });
});