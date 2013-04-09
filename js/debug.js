var debug = (function() {
    var slice = [].slice,
        logEl = document.getElementById('debug');

    function debug() {
        var msg = slice.call(arguments).join(" "), // must slice to convert arguments to real Array
            p = document.createElement('p'),
            t = document.createTextNode(msg);
        p.appendChild(t);
        logEl.appendChild(p);
    }

    if (typeof window !== 'undefined') {
        // Useful for seeing JS errors on mobile browsers
        window.onerror = function(message, url, line) {
            if (url === undefined && line === undefined) {
                debug(message, "[undefined location]");
            } else {
                debug(message, "in", url, "line", line);
            }
        };
    }

    if (typeof console === 'undefined') {
        // Polyfill console.log
        console = {
            log: function() {
                debug.call(["CONSOLE:"].concat(arguments));
            }
        };
    }

    return debug;
})();
