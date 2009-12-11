$.extend({
    newMember: function(group, name) {
        ge = $.groupElement(group);
        var ue = $.userElement(name);
        ge.find(".add-member").before(ue);
        return ue;
    },
    groupElement: function(name) {
        var already = $(".group").filter(function() {return $(this).find("h2").text() == name;});
        if (already.length > 0) {
            return already;
        } else {
            var ge = $._groupElement(name);
            $(".groups").append(ge);
            return ge;
        }
    },
    _groupElement: function(name) {
        var element = $('<div class="group"><h2><a>music</a></h2><ul class="members"><li class="add-member"><form><input type="text" /><span class="submit clickable-image"><img class="button" src="http://wedictionary.appspot.com/image/add.png"></span></form></li></ul>');
        element.find("h2 a").attr("href", "http://twitter.com/public_list/" + name).text(name);

        element.find("form").submit(function() { //XXX
            var name = $(this).find(":text:first").val();
            if (name.length == 0) return false;
            $(this).find(":text:first").val("");
            var group = $(this).closest(".group").find("h2").text();
            $.newMember(group, name);
            return false;
      });

        return element;
    },
    userElement: function(name) {
        var image = "http://img.tweetimag.es/i/" + name + "_m";
        var element = $("<li>").addClass("member").append(
            $("<img>").addClass("profile-icon").attr("src", image)
            ).append(
                $("<span>").addClass("user-name").append(
                    $("<strong>").append($("<a>").attr("href", "http://twitter.com/" + name).text(name))
                )
            ).append(
                $("<span>").addClass("delete").append(
                    $("<img>").addClass("clickable-image").attr("src", "http://wedictionary.appspot.com/image/delete.png")
                )
        );
        return element;
    }
});

$(function() {
    $(".member .delete").live("click", function() {
        $(this).closest(".member").remove();
    });
    $(".submit").live("click", function() {
        $(this).closest("form").submit();
    });

    $(".create-list form").submit(function() {
        var name = $(this).find(":test:first").val();
        $(this).find(":test:first").val("");
        if (name.length == 0) return false;
        $.groupElement(name);
        return false;
    });
      
    try {
        $.newMember("music", "kohmi");
        $.newMember("music", "mochilon");
        $.newMember("music", "motemen");
        $.newMember("fse", "hakobe");
    } catch(e) {
        console.log(e);
    }
});