$(function() {
    var viewData = function(data) {
        $("#result").prepend($("<div>").addClass('item').text(data.value));
    };

    var postEntry = function() {
        var submit = $("form :submit");
        submit.attr('disabled', 'disabled');
        $.ajax({
            type: "post",
            url: "http://gigaschema.appspot.com/hitode909/diary.json",
            data: {
                value: $("textarea").val()
            },
            success: function(res) {
                viewData(res.data[0]);
            },
            complete: function() {
                submit.attr('disabled', '');
            },
            error: function(res) {
                alert(res);
            },
            dataType: "json"
        })
        $("textarea").val("");
    };

    $('form').submit(function(event) {
        postEntry();
        event.preventDefault();
    });

    $.getJSON("http://gigaschema.appspot.com/hitode909/diary.json", function(res) {
        res.data.reverse().slice(-20, -1).forEach(function(item) {
            viewData(item);
        });
    });

    $('textarea').focus();
});
