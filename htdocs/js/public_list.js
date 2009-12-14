var public_lis_object = {
    // API呼び出し
    api: {
        groups: function(callback) {
            $.getJSON("/public_list/api", callback);
        },
        add: function(group, member, callback) {
            if (group.length == 0 || member.length == 0) return;
            $.ajax({
                url: ["/public_list/api", group, member].join("/"),
                type: "PUT",
                dataType: "json",
                success: callback,
                error: function(e) {
                    alert(e);
                }
            });
        },
        delete: function(group, member, callback) {
            if (group.length == 0 || member.length == 0) return;
            $.ajax({
                url: ["/public_list/api", group, member].join("/"),
                type: "DELETE",
                dataType: "json",
                success: callback,
                error: function(e) {
                    alert(e);
                }
            });
        }
    },
    // エレメント作成，イベント，データ割り当て
    element: {
        group: function(name) {
            var element = $('<div class="group"><h2><a>music</a></h2><ul class="members"><li class="add-member"><form><input type="text" /><span class="submit clickable-image"><img class="button" src="http://wedictionary.appspot.com/image/add.png"></span></form></li></ul>');
            element.find("h2 a").attr("href", "http://twitter.com/public_list/" + name).text(name);

            element.find("form").submit(function() { //XXX
                var name = $(this).find(":text:first").val();
                if (name.length == 0) return false;
                $(this).find(":text:first").val("");
                $(this).closest(".group").addMember(name);
                return false;
            });
            element.data("name", name);
            return element;
        },
        member: function(name) {
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
            element.data("name", name);
            return element;
        }
    }
};

$.extend({public_list: public_lis_object});

$.fn.extend({
    theGroup: function(name) {
        var already = $(this).find(".group").filter(function() {return $(this).data("name") == name;})[0];
        if (already) return $(already);
        return $(this).appendGroup(name);
    },
    theMember: function(name) {
        var already = $(this).find(".member").filter(function() {return $(this).data("name") == name;})[0];
        if (already) return already;
        return $(this).appendMember(name);
    },
    hasGroup: function(name) {
        return $(this).find(".group").filter(function() {return $(this).data("name") == name;}).length > 0;
    },
    hasMember: function(name) {
        return $(this).find(".member").filter(function() {return $(this).data("name") == name;}).length > 0;
    },            
    addMember: function(name) {
        if ($(this).hasMember(name)) {
            return;
        }
        var self = this;
        $.public_list.api.add($(this).data("name"), name, function() {
            $(self).appendMember(name);
        });
    },
    appendMember: function(name) {
        var em = $.public_list.element.member(name);
        $(this).find(".add-member").before(em);
        return em;
    },
    deleteMember: function() {  //this is .group
        var group_name = $(this).closest(".group").data("name");
        var member_name = $(this).data("name");
        var self = this;
        $.public_list.api.delete(group_name, member_name, function() {
            $(self).remove();
        });
    },
    appendGroup: function(name) {
        var e = $.public_list.element.group(name);
        $(this).append(e);
        return e;
    }
});
    
$(function() {
    $(".member .delete").live("click", function() {
        if (true || confirm("delete?"))
            $(this).closest(".member").deleteMember();
    });
    $(".submit").live("click", function() {
        $(this).closest("form").submit();
    });

    $(".create-list form").submit(function() {
        var name = $(this).find(":test:first").val();
        $(this).find(":test:first").val("");
        if (name.length == 0) return false;
        $(".groups").theGroup(name);
        return false;
    });

    var groups = $(".groups");
    $.public_list.api.groups(function(data) {
        $.each(data, function(group, members) {
            var group_element = undefined;
            $.each(members, function(index, member) {
                try {
                    if(!group_element) group_element = groups.theGroup(group);
                    group_element.appendMember(member);
                    //$.public_list.controller.newMember(group, member);
                } catch(e) {
                    console.log(e);
                }
            });
        });
    });
});