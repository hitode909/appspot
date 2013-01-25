
(function() {
    // var MouseUtil = { };
    // ['mousemove', 'mousedown', 'mouseup', 'click'].forEach(function (method) {
    //     MouseUtil[method] = function(x, y) {
    //         if (!x) x = 0;
    //         if (!y) y = 0;
    //         var event = document.createEvent("MouseEvents");
    //         event.initMouseEvent(method, true, false, window,
    //                              0, x, y, x, y, false, false, true, false, 0, null );
    //         return event;
    //     };
    // });


    var timer = setInterval(function() {
        var toolbox = $('.hatena-outline-toolbox');
        if (!toolbox.length) return;
        // clearInterval(timer);

        console.log('trigger');

        toolbox.bind('drop', function(event) {
            console.log(event);
            event.dataTransfer.setData('text/html','こんにちは!!!!');
        });

        return;

        // var event = {
        //     dataTransfer: {
        //         getData: function() {
        //             alert('hello');
        //             console.log('getData!!!');
        //             return 'hello';
        //         },
        //     }
        // };

        // toolbox.trigger('drop', event);

        // return;


        var dropEvent = document.createEvent ("DragEvent");
        dropEvent.initDragEvent("dragstart", true, true, window, 0,
                                 0, 0, 0, 0,
                                 false, false, false, false,
                                0, null, {});
        dropEvent.dataTransfer.setData('Text', 'Hello');
        console.log(dropEvent);
        console.log(dropEvent.dataTransfer.items);
        toolbox[0].dispatchEvent(dropEvent);

        // toolbox.bind('drop', function(event) {
        //     console.log('my drop');
        //     console.log(event);
        //     event.preventDefault();


        //     setTimeout(function() {
        //         toolbox[0].dispatchEvent(event);
        //     }, 1000);
        // });


    }, 1000);

})();