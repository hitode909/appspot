var TextToImage;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
TextToImage = (function() {
  function TextToImage() {
    this.text = '';
    this.font = void 0;
    this.lineHeight = 1.2;
    this.width = void 0;
    this.color = void 0;
    this.background = void 0;
  }
  TextToImage.prototype.createImage = function(type, quality) {
    var img;
    img = document.createElement('img');
    img.src = this.createDataURL(type, quality);
    return img;
  };
  TextToImage.prototype.createDataURL = function(type, quality) {
    return this.createCanvas().toDataURL(type, quality);
  };
  TextToImage.prototype.createCanvas = function() {
    var canvas, canvasHeight, canvasSize, canvasWidth, char, charWidth, color, ctx, fontSize, nextLine, positionX, positionY, _i, _len, _ref;
    canvasSize = this._calculateCanvasSize();
    canvasWidth = canvasSize.width;
    canvasHeight = canvasSize.height;
    canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    color = this.color || ctx.fillStyle;
    if (this.background) {
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    if (this.font) {
      ctx.font = this.font;
    }
    fontSize = this._getFontSizeFromFont(ctx.font);
    positionX = 0;
    positionY = 0;
    nextLine = __bind(function() {
      positionX = 0;
      return positionY = positionY + fontSize * this.lineHeight;
    }, this);
    _ref = this.text.split('');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      char = _ref[_i];
      charWidth = (ctx.measureText(char)).width;
      if (positionX + charWidth > canvasWidth) {
        nextLine();
      }
      if (char === "\n") {
        nextLine();
      }
      if (char === "\n") {
        continue;
      }
      ctx.fillText(char, positionX, positionY);
      positionX += charWidth;
    }
    return canvas;
  };
  TextToImage.prototype._getFontSizeFromFont = function(font) {
    var size, _, _ref;
    _ref = font.match(/(\d+)px/), _ = _ref[0], size = _ref[1];
    return +size;
  };
  TextToImage.prototype._calculateCanvasSize = function() {
    var canvas, char, charWidth, ctx, fontSize, maxX, nextLine, positionX, positionY, _i, _len, _ref;
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    if (this.font) {
      ctx.font = this.font;
    }
    fontSize = this._getFontSizeFromFont(ctx.font);
    positionX = 0;
    positionY = 0;
    maxX = 0;
    nextLine = __bind(function() {
      positionX = 0;
      return positionY = positionY + fontSize * this.lineHeight;
    }, this);
    _ref = this.text.split('');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      char = _ref[_i];
      charWidth = (ctx.measureText(char)).width;
      if ((this.width != null) && positionX + charWidth > this.width) {
        nextLine();
      }
      if (char === "\n") {
        nextLine();
      }
      if (char === "\n") {
        continue;
      }
      positionX += charWidth;
      if (positionX > maxX) {
        maxX = positionX;
      }
    }
    return {
      width: this.width || maxX,
      height: positionY + fontSize * this.lineHeight
    };
  };
  return TextToImage;
})();