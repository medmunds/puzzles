//
// Memory usage monitoring for Emscripten runtime
//
var CMemoryMonitor = (function($, globalScope) {
    "use strict";

    var CMemoryMonitor = {};

    if (typeof Object.defineProperty !== 'function') {
        // Can't monitor peak memory usage
        return CMemoryMonitor;
    }

    CMemoryMonitor.MAX_STACK_USED = 0;
    CMemoryMonitor.MAX_STATIC_USED = 0;

    // Define Emscripten runtime globals STACKTOP and STATICTOP
    // so we can monitor their peaks...

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
            CMemoryMonitor.MAX_STACK_USED = max_stacktop - STACK_ROOT;
        },
        get: function() {
            return _stacktop;
        }
    });
    Object.defineProperty(globalScope, 'STATICTOP', {
        set: function(val) {
            _statictop = val;
            max_statictop = Math.max(max_statictop, _statictop);
            CMemoryMonitor.MAX_STATIC_USED = max_statictop - STACK_MAX;
        },
        get: function() {
            return _statictop;
        }
    });


    // Display memory usage in meters, if we can find a #debug element to host
    function initMeters($debug) {
        if (typeof STACK_MAX === 'undefined') {
            throw "Must call initMeters after Emscripten runtime is loaded";
        }

        $debug = $($debug);
        MemoryMeter($debug, "Static", TOTAL_MEMORY - STACK_MAX, function () {
            return { current: STATICTOP - STACK_MAX, peak: CMemoryMonitor.MAX_STATIC_USED };
        });
        MemoryMeter($debug, "Stack", STACK_MAX - STACK_ROOT, function() {
            return { current: STACKTOP - STACK_ROOT, peak: CMemoryMonitor.MAX_STACK_USED };
        });
    }
    CMemoryMonitor.initMeters = initMeters;

    function MemoryMeter($parent, label, max, getData, updateInterval) {
        updateInterval = updateInterval || 500;
        var $wrapper = $('<div class="memory-meter"></div>'),
            $label = $('<span class="label"></span>').appendTo($wrapper),
            $meter = $('<span class="meter"></span>').appendTo($wrapper),
            $curBar = $('<span class="current"></span>').appendTo($meter),
            $peakBar = $('<span class="peak"></span>').appendTo($meter),
            $peakLabel = $('<span class="peak-label"></span>').appendTo($meter),
            $maxLabel = $('<span class="max-label"></span>').appendTo($meter);

        $label.text(label);
        $maxLabel.text(hex(max));
        $parent.prepend($wrapper);

        function update() {
            var data = getData(),
                curVal = data.current,
                curFract = curVal / max,
                peakVal =data.peak,
                peakFract = peakVal / max,
                meterWidth = $meter.width();
            var curLabel = hex(curVal) + " (" + pct(curFract) + ")",
                peakLabel = hex(peakVal) + " (" + pct(peakFract) + ")";
            $curBar
                .width(curFract * meterWidth)
                .attr('title', curLabel);
            $peakBar.width(peakFract * meterWidth);
            $peakLabel.text(peakLabel);
        }

        update();
        setInterval(update, updateInterval);
    }

    function pct(val) {
        return (Math.round(val * 100) | 0) + "%";
    }
    function hex(val) {
        return "0x" + val.toString(16);
    }

    return CMemoryMonitor;

})(jQuery, window);
