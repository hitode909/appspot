// javascript:(function(){var%20s=document.createElement('script');s.charset='UTF-8';s.src='http://hitode909.appspot.com/js/tinydebugger.js?random='+Math.random();(document.getElementsByTagName('head')[0]||document.body).appendChild(s);})();

// http://opera.higeorange.com/misc/jsToSource.html
Object.prototype.toS = function() {
    var con = this.constructor;
    if(con == String) {
        return '"' + this + '"';
    } else if(con == Number) {
        return this;
    } else if(con == Array) {
        var res = '[';
        for(var i=0,len=this.length;i<len;i++) {
            if(i == len-1)
                res += this[i].toS() + ']';
            else
                res += this[i].toS() + ', ';
        }
        return res;
    } else if(con == RegExp) {
        return this;
    } else if(con == Object) {
        var res = '{';
        var i=0;
        for(var j in this) {
            if(j != 'toS') {
                if(i == 0) {
                    res += j + ':' + this[j].toS(1);
                } else {
                    res += ', ' + j + ':' + this[j].toS(1);
                }
                i++;
            }
        }
        res += '}';
        if(arguments.length) {
            return res;
        } else {
            return '(' + res + ')';
        }
    }
};

TinyDebugger = {
    execute: function() {
	var source = document.getElementById("textarea").value;
	var newsource;
        try {
	    newsource = "(function(){return " + source + "})";
            eval(newsource);
	} catch(e) {
	    try {
		newsource = "(function(){" + source + "})";
		eval(newsource);
	    } catch(e) {
		TinyDebugger.error(e);
		return;
	    }
	}
	try {
	    var result = eval(newsource+"()");
	    TinyDebugger.log(result);
	} catch(e) {
	    TinyDebugger.error(e);
	}
    },
    log: function(content, error) {
        var result_box = document.getElementById("result");
        var result = "";
        try {
            result = content.toS();
        } catch(e) {
	    result = content;
        }
	var resultelem = document.createElement("div");
	resultelem.innerHTML = result;
	if (error) {
	    resultelem.style.color = "#f00";
	} else {
	    resultelem.style.background = "#ddf";
	}
        if (result_box.childNodes) {
            result_box.insertBefore(resultelem, result_box.childNodes[0]);
        } else {
            result_box.appendChild(resultelem);
        }
    },
    error: function(content) {
        TinyDebugger.log(content.toString(), true);
    },
    append_debugger: function() {
	var root = document.createElement("div");
	//	root.style.width = "250px";
	root.id = "tinydebugger";
	root.innerHTML = '<textarea rows="5" cols="25" id="textarea"></textarea><div><button onclick="TinyDebugger.execute()">eval</button><button onclick="TinyDebugger.reset_log()">reset log</button></div><span id="result"></span>';
	document.body.appendChild(root);
    },
    reset_log: function() {
        var result = document.getElementById("result");
        while (result.firstChild)
            result.removeChild(result.firstChild);
    }
};

log = TinyDebugger.log;

TinyDebugger.append_debugger();
