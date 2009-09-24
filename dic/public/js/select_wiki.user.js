// ==UserScript==
// @name           select wiki
// @namespace      http://www.hatena.ne.jp/hitode909/
// @description    select wiki
// @include        *
// @require        http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require        http://www.hatena.ne.jp/js/Ten.js
// @require        http://www.hatena.ne.jp/js/Ten/Ten/SubWindow.js
// ==/UserScript==

var RootURI = "http://hitode909.appspot.com/dic/";
//var RootURI = "http://localhost:8080/dic/";

var api = function(path) {
    return RootURI + "api/" + path;
};

var filterTextNode = function(element, filter) {
    if (!element) return null;
    if (element.nodeType == 3 && !/^(textarea|script|style)$/i.test(element.parentNode.tagName) ) {
        filter(element);
    } else {
        var children = element.childNodes;
        for (var i=0; i < children.length; i++){
            filterTextNode(children[i], filter);
        }
    }
};
    
var gotDescription = function(element, response) {
    if (response.status != 200) return;
    try {
        var data = eval("(" + response.responseText + ")");
    } catch (e) {
        console.log(e);
        return;
    }
    var el = $("<div>");
    el.append($("<h3>").text(data.word.name));

    var ul = $("<ul>");
    for (var i=0; i < data.word.descriptions.length; i++) {
        var description = data.word.descriptions[i];
        var li = $("<li>").text(description.body);
        var del_button = $("<img>").attr("src", RootURI + "image/delete.png").css({cursor: "pointer"});
        li.append(del_button);
        del_button.data("key", description.key);
        del_button.click(function(){
            var el = $(this);
            GM_xmlhttpRequest({
                method: "DELETE",
                url: api("word") + ["?word=", data.word.name, "&key=", el.data("key")].join(""),
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    } else {
                        document.write(uneval(response));
                    }
                }
            });
        });
        ul.append(li);
    }
    ul.append($("<li>").append(addElement(element, data.word.name)));
    el.append(ul);
    $(element).empty().append(el);
};

var addElement = function(element, name) {
    if (!name) return null;
    var form = $("<form>");
    var input = $("<input>").attr({name: "body"});
    var add_button = $("<img>").attr("src", RootURI + "image/add.png").css({cursor: "pointer"});
    add_button.click(function(){
        var body = input.val();
        GM_xmlhttpRequest({
                method: "POST",
                url: api("word"),
            data: ["word=", name, "&description=", encodeURIComponent(body)].join(""),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    }
                }
            });
        input.val("");
    });
    form.append(input);
    form.append(add_button);
    return form;
};;

var descriptionElement = function(element, name) {
    $(element).empty().append($("<h3>").text(name));
    var ul = $("<ul>");
    ul.append($("<li>").append(addElement(element, name)));
    $(element).append(ul);

    GM_xmlhttpRequest({
            method: "GET",
            url: api("word?word=" + name),
            onload: function(response) {
                gotDescription(element, response);
            }
        });
};

var getWordsObject = function() {
    var words = GM_getValue("words");
    return eval("("+words+")");
};


var gotWords = function(words) {
    //XXX: wordsのescape! が必要
    console.log("(" + words.join('|') + ")");
    var regex = new RegExp("(" + words.join('|') + ")", "ig");
    var tmp = [];
    filterTextNode(document.body, function(textNode) {
        var parent = textNode.parentNode;
        var df = document.createDocumentFragment();
        var text = textNode.nodeValue;
        //XXX:IEでは動く気がしない
        var flag = false;
        var x = text.split(regex);
        for(var i = 0; i< x.length; i++) {
            flag = !flag;
            if(flag) {
                df.appendChild(document.createTextNode(x[i]));
            } else {
                var e = document.createElement('span');
                e.className = 'select-wiki-keyword-new';
                e.appendChild(document.createTextNode(x[i]));
                df.appendChild(e);
            }
        }
        tmp.push([df, textNode]);
    } );
    for(var i=0; i<tmp.length; i++) {
        tmp[i][1].parentNode.replaceChild(tmp[i][0], tmp[i][1]);
    }
    var elems = $(".select-wiki-keyword-new").removeClass("select-wiki-keyword-new").addClass("select-wiki-keyword");

    var self = this; //XXX:使ってない気がする
    elems.mouseover(function() {
        var w = new Ten.SubWindow;
        descriptionElement(w.container, $(this).text());
        $(w.container).attr('id', 'ten-subwindow-container');
        var pos = Ten.Geometry.getElementPosition(this);
        w.show({x: pos.x + $(this).width(), y: pos.y + $(this).height() });
    });
};

//

with (Ten.SubWindow) {
    showScreen = false;
    draggable = true;
    style = {
        zIndex: 2000,
        width: "18em",
        height: "20em"
    };
    style.textAlign = "left";
};

jQuery(document).mouseup(function(){
    var selection = content.window.getSelection(); // XXX:ふつうのjs化したいので，うまくやりたい
    if (!selection.rangeCount) return;
    var range = selection.getRangeAt(0);
    if (range.startOffset == range.endOffset || range.startContainer != range.endContainer || range.collapsed) return;
    var name = selection.toString();
    if (name.length) {
        gotWords([name]);
    }
});

var words = GM_getValue("words");
if (typeof(words) == "undefined" || true) {
    GM_xmlhttpRequest({
        method: "GET",
        url: api("words"),
        onload: function(response) {
            GM_setValue("words", response.responseText);
            var data = eval("("+response.responseText+")");
            gotWords(data.words);
        }
    });
} else {
    gotWords(words);
}

var style = $("<style>").html(
    [
    ".select-wiki-keyword {",
    "text-decoration: underline;",
    "cursor: pointer;",
    "background-color: #ffa;",
    "}",
    "#ten-subwindow-container {",
    "font-color: #000;",
    "margin: 0px;",
    "padding: 0px;",
    "offset: 0px;",
    "border-width: 0px;",
    "width: auto;",
    "background: transparent;",
    "}",
    "#ten-subwindow-container h3{",
    "font-size: 20px;",
    "font-color: #000;",
    "margin: 10px;",
    "padding: 5px;",
    "offset: 0px;",
    "font-weight: bold;",
    "border-width: 0px;",
    "}",
    "#ten-subwindow-container ul{",
    "font-color: #000;",
    "margin:  0px;",
    "padding: 20px 4px;",
    "offset: 0px;",
    "}",
    "#ten-subwindow-container li{",
    "list-style-type: none;",
    "font-size: 14px;",
    "font-color: #000;",
    "margin:  2px;",
    "padding: 2px;",
    "offset: 0px;",
    "}"
    ].join("\n"));
$("head").append(style);
