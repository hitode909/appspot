Plotter = function(target, valueMax) {
    if (!target) target = document.querySelector('canvas');
    this.target = target;
    this.context = this.target.getContext('2d');
    this.context.fillstyle = 'black';
    this.valueMax = valueMax;
}

Plotter.prototype = {
    plot: function(values) {
        var rateX = this.target.width / values.length; // 1データは横に何px?
        var skip = values.length / this.target.width;  // 何データに1回plotするか
        var rateY = this.target.height; // 値1は縦に何px?

        var width = this.target.width;
        var height = window.innerHeight;

        valueMax = this.valueMax;
        if (!valueMax) {
            for(var i = 0; i < values.length; i++) {
                if (values[i] > valueMax) valueMax = values[i];
            }
        }

        for(var x = 0; x < width; x++) {
            var i = Math.floor(x * skip);
            var val = Math.pow(values[i] / valueMax, 2) * rateY;
            this.context.fillRect(x, (height - val) / 2, 1 , val);
        }
        this.context.stroke();
    },
    clear: function() {
        this.context.clearRect(0, 0, this.target.width, this.target.height);
    }
}