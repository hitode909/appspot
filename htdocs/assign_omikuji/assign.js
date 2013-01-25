$(function() {
  var $preview, currentUser, users;
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
  setInterval(function() {
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
  }, 10);
  $preview.click(function() {
    ($('#names')).append(($('<div>')).text(currentUser));
    return alert(currentUser);
  });
  return ($('form')).submit(function() {
    ($('#add-user')).click();
    return false;
  });
});