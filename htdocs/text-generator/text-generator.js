var TextGenerator;
TextGenerator = (function() {
  function TextGenerator(source, gram_length) {
    this.source = source;
    this.gram_length = gram_length;
    this.gram_length || (this.gram_length = 3);
    this.prepare();
  }
  TextGenerator.prototype.prepare = function() {
    var current_node, index, last_node, _base, _ref, _ref2, _results;
    this.table = {};
    last_node = this.source.slice(0, this.gram_length);
    _results = [];
    for (index = 1, _ref = this.source.length - this.gram_length; 1 <= _ref ? index <= _ref : index >= _ref; 1 <= _ref ? index++ : index--) {
      current_node = this.source.slice(index, index + this.gram_length);
      if ((_ref2 = (_base = this.table)[last_node]) == null) {
        _base[last_node] = [];
      }
      this.table[last_node].push(current_node);
      _results.push(last_node = current_node);
    }
    return _results;
  };
  TextGenerator.prototype.get = function() {
    var _ref;
    if ((_ref = this.last_selected) == null) {
      this.last_selected = this.get_first();
    }
    this.last_selected = this.get_next_of(this.last_selected);
    return this.last_selected[this.last_selected.length - 1];
  };
  TextGenerator.prototype.get_from_text = function(text) {
    var node;
    if (!(text && text.length)) {
      return '';
    }
    node = this.get_next_of(text);
    if (!node) {
      return text;
    }
    return text + node[node.length - 1];
  };
  TextGenerator.prototype.get_first = function() {
    return this.selectRandom(_.keys(this.table));
  };
  TextGenerator.prototype.get_next_of = function(text) {
    var node;
    node = text.slice(text.length - this.gram_length, text.length);
    if (!(this.table[node] && this.table[node].length)) {
      return null;
    }
    return this.table[node][Math.floor(Math.random() * this.table[node].length)];
  };
  TextGenerator.prototype.selectRandom = function(list) {
    return list[Math.floor(Math.random() * list.length)];
  };
  return TextGenerator;
})();