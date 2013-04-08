(function(globalScope) {
    "use strict";

    // Glue for referencing JS objects from C as (opaque) void* handles.

    var handle_map = {},
        last_handle = 7000;

    function CHandle(obj) {
        var chandle = obj.chandle;
        if (!chandle) {
            chandle = ++last_handle;
            handle_map[chandle] = obj;
            obj.chandle = chandle;
            obj.free = function() {
                if (handle_map[chandle] === obj) {
                    handle_map[chandle] = "deadbeef";
                } else {
                    throw "calling CHandle.free on already-freed object";
                }
            };
        }
        return chandle;
    }

    var exported_functions = {};

    function export_to_c(method, name, rettype, argtypes) {
        rettype = rettype || 'void';
        argtypes = argtypes || [];
        var _name = '_' + name;
        globalScope[_name] = exported_functions[_name] = function() {
            // Convert arguments from C to JavaScript types:
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < argtypes.length; i++) {
                switch (argtypes[i]) {
                    case 'string':
                        args[i] = Pointer_stringify(args[i]);
                        break;
                    case 'handle':
                        args[i] = handle_map[args[i]];
                        break;
                }
            }
            var retval;
            if (argtypes.length >= 1 && argtypes[0] == 'handle') {
                // If first argtype is handle, call as a method on that object
                var obj = args.shift();
                retval = method.apply(obj, args);
            } else {
                retval = method.apply(args);
            }
            // Convert return from JavaScript to C types
            switch (rettype) {
                case 'string':
                    retval = allocate(intArrayFromString(retval), 'i8', ALLOC_STACK);
                    break;
                case 'handle':
                    retval = CHandle(retval);
                    break;
            }
            return retval;
        }
    }
    Module.export_to_c = export_to_c;

    function reexport_all_to_c(scope) {
        // Necessary to work around an IE8 bug that removes our functions
        // from window when the Emscripten generated code declares var statements
        // for them. Call from Emscripten pre-js.
        scope = scope || globalScope;
        Object.keys(exported_functions).map(function(_name) {
            scope[_name] = exported_functions[_name];
        });
    }
    Module.reexport_all_to_c = reexport_all_to_c;

    function c_to_js_array(ptr, len, type) {
        var ptrtype = type + '*',
            size = Runtime.getNativeTypeSize(type),
            arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(getValue(ptr, ptrtype));
            ptr += size;
        }
        return arr;
    }
    Module.c_to_js_array = c_to_js_array;

    globalScope.CHandle = CHandle;
})(window);


//
// Memory tracking
//

if (typeof Object.defineProperty === 'function') {
    (function(globalScope) {
        "use strict";

        globalScope.MAX_STACK_USED = 0;
        globalScope.MAX_STATIC_USED = 0;

        var _stacktop,
            _statictop,
            max_stacktop = 0,
            max_statictop = 0;

        Object.defineProperty(globalScope, 'STACKTOP', {
            set: function(val) {
                if (val >= STACK_MAX) {
                    throw "Stack overflow";
                }
                _stacktop = val;
                max_stacktop = Math.max(max_stacktop, _stacktop);
                globalScope.MAX_STACK_USED = max_stacktop - STACK_ROOT;
            },
            get: function() {
                return _stacktop;
            }
        });
        Object.defineProperty(globalScope, 'STATICTOP', {
            set: function(val) {
                _statictop = val;
                max_statictop = Math.max(max_statictop, _statictop);
                globalScope.MAX_STATIC_USED = max_statictop - STACK_MAX;
            },
            get: function() {
                return _statictop;
            }
        });
    })(window);
}


(function($, globalScope) {
    "use strict";

    function pct(val) {
        return (Math.round(val * 100) | 0) + "%";
    }
    function hex(val) {
        return "0x" + val.toString(16);
    }

    function Meter(el, max, getData) {
        var $meterEl = $(el),
            meterWidth = $meterEl.width(),
            $curBar = $('<span class="current"></span>').appendTo($meterEl),
            $peakBar = $('<span class="peak"></span>').appendTo($meterEl),
            $peakLabel = $('<span class="peakLabel"></span>').appendTo($meterEl),
            $maxLabel = $('<span class="maxLabel"></span>').appendTo($meterEl);

        $maxLabel.text(hex(max));

        function update() {
            var data = getData(),
                curVal = data.current,
                curFract = curVal / max,
                peakVal =data.peak,
                peakFract = peakVal / max;
            var curLabel = hex(curVal) + " (" + pct(curFract) + ")",
                peakLabel = hex(peakVal) + " (" + pct(peakFract) + ")";
            $curBar
                .width(curFract * meterWidth)
                .attr('title', curLabel);
            $peakBar.width(peakFract * meterWidth);
            $peakLabel.text(peakLabel);
        }

        update();
        setInterval(update, 500);
    }

    globalScope.Meter = Meter;

})(jQuery, window);


