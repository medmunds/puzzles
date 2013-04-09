/* events.js
 * Puzzle user event handling
 */
var Events = (function($) {
    "use strict";

    var puzzle,
        $app,
        $canvas,
        canvas;

    // from puzzles.h:
    var LEFT_BUTTON    = 0x0200,
        MIDDLE_BUTTON  = 0x0201,
        RIGHT_BUTTON   = 0x0202,
        LEFT_DRAG      = 0x0203,
        MIDDLE_DRAG    = 0x0204,
        RIGHT_DRAG     = 0x0205,
        LEFT_RELEASE   = 0x0206,
        MIDDLE_RELEASE = 0x0207,
        RIGHT_RELEASE  = 0x0208,

        CURSOR_UP      = 0x0209,
        CURSOR_DOWN    = 0x020A,
        CURSOR_LEFT    = 0x020B,
        CURSOR_RIGHT   = 0x020C,
        CURSOR_SELECT  = 0x020D,
        CURSOR_SELECT2 = 0x020E, // a.k.a. delete

        MOD_CTRL       = 0x1000,
        MOD_SHFT       = 0x2000,
        MOD_NUM_KEYPAD = 0x4000,
        MOD_MASK       = 0x7000; /* mask for all modifiers */


    // from https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
    var VK_SPACE = 0x20,
        VK_LEFT = 0x25,
        VK_UP = 0x26,
        VK_RIGHT = 0x27,
        VK_DOWN = 0x28,
        VK_SELECT = 0x29,
        VK_RETURN = 0x0D,
        VK_BACK_SPACE = 0x08,
        VK_DELETE = 0x2E;

    var keymap = {};
    keymap[VK_UP] = CURSOR_UP;
    keymap[VK_DOWN] = CURSOR_DOWN;
    keymap[VK_LEFT] = CURSOR_LEFT;
    keymap[VK_RIGHT] = CURSOR_RIGHT;
    keymap[VK_BACK_SPACE] = 0x7F;
    keymap[VK_DELETE] = 0x7F;


    function getMods(evt) {
        var mods = 0;
        if (evt.ctrlKey || evt.metaKey) {
            mods |= MOD_CTRL;
        }
        if (evt.shiftKey) {
            mods |= MOD_SHFT;
        }
        return mods;
    }


    var mouseEventMap = {
        'mousedown': LEFT_BUTTON,
        'mousemove': LEFT_DRAG,
        'mouseup': LEFT_RELEASE
    };


    var canvasOffset; // cached for the durationof a mouse drag sequence

    function mouseEvent(evt) {
        if (evt.which === 0) {
            // mouse moving over canvas with no button down -- game doesn't care
            return undefined;
        }

        var x = evt.offsetX,
            y = evt.offsetY,
            updateControls = (evt.type === "mouseup");
        if (x === undefined || evt.target !== canvas) {
            // Firefox doesn't supply offsetX,Y
            // IE does, but they're relative to excanvas's VML shapes (rather than the canvas)
            if (evt.type === "mousedown" || !canvasOffset) {
                // Cache offset for duration of mouse drag sequence
                canvasOffset = $canvas.offset();
            }
            x = evt.pageX - canvasOffset.left;
            y = evt.pageY - canvasOffset.top;
        }
        var button = mouseEventMap[evt.type] + evt.which - 1, // which: 1,2,3 left,mid,right
            mods = getMods(evt);

        puzzle.handleInput(x, y, button | mods, !updateControls);
        return false;
    }

    function touchEvent(evt) {
        evt.preventDefault(); // we consume the touch event

        var type = null,
            touch = evt.changedTouches[0],
            button = 1;
        switch (evt.type) {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup"; break;
        }
        var mouseEvent = $.Event(type, {
            altKey: evt.altKey,
            bubbles: true,
            button: button,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            ctrlKey: evt.ctrlKey,
            currentTarget: canvas,
            detail: button,
            metaKey: evt.metaKey,
            originalTarget: evt.originalTarget,
            pageX: touch.pageX,
            pageY: touch.pageY,
            relatedTarget: null,
            screenX: touch.screenX,
            screenY: touch.screenY,
            shiftKey: evt.shiftKey,
            which: button
        });

        //debug(mouseEvent.type, mouseEvent.which, mouseEvent.clientX, mouseEvent.clientY);
        $canvas.trigger(mouseEvent);

        return false;
    }


    var asciiz = 'z'.charCodeAt(0),
        asciiZ = 'Z'.charCodeAt(0),
        asciiy = 'y'.charCodeAt(0),
        asciiY = 'Y'.charCodeAt(0),
        asciiCtrlZ = 26,
        asciiCtrlY = 25;

    function keyEvent(evt) {
        // keydown event for special keys; keypress for ordinary keys
        var button,
            mods = getMods(evt),
            wantit = false,
            retval;

        //var desc = String(evt.which) + " '" + String.fromCharCode(evt.which) + "'";
        //if (evt.shiftKey) desc += " shift";
        //if (evt.metaKey) desc += " ctrl";
        //if (evt.ctrlKey) desc += " meta";
        //console.log(evt.type + ": " + desc);

        if (evt.type == "keypress") {
            // ASCII keys (including printable, ctrl chars, etc.)
            button = evt.which; // jQuery normalizes charCode, etc. to here
            wantit = !(evt.metaKey || evt.ctrlKey); // leave Command/Ctrl combos to the browser
        } else {
            // Keydown/keyup: arrows and other non-ASCII keys
            button = keymap[evt.which]; // jQuery normalizes keyCode to here
            if (evt.metaKey || evt.ctrlKey) {
                // Handle Command/Ctrl+Z and +Y
                if (evt.which === asciiZ) {
                    button = evt.shiftKey ? asciiCtrlY : asciiCtrlZ;
                    mods = 0;
                    wantit = true;
                } else if (evt.which === asciiY) {
                    button = asciiCtrlY;
                    mods = 0;
                    wantit = true;
                }
            }

            wantit = !!button; // if we have a mapping, handle it; else leave it to the browser
        }
        //console.log("   wantit: " + wantit + " button=" + button + ", mods=" + mods.toString(16));

        if (wantit) {
            puzzle.handleInput(-1, -1, button | mods);
            evt.preventDefault();
            retval = false;
        }
        return retval;
    }

    function virtualKeyboardPress(evt) {
        var $button = $(evt.target),
            keycode = $button.attr('data-key'),
            key;

        if (keycode) {
            key = parseInt(keycode);
        } else {
            key = $button.text().charCodeAt(0);
        }
        if (key) {
            puzzle.handleInput(-1, -1, key);
        }
    }

    function initEvents(_puzzle, _$app, _$canvas) {
        puzzle = _puzzle;
        $app = _$app;
        $canvas = _$canvas;
        canvas = $canvas.get(0);

        $(document).on('keydown keypress', keyEvent);
        $canvas.on('mousedown mousemove mouseup', mouseEvent);
        // jQuery 2 seems to have a bug accessing undefined objects in touch events
        //$canvas.on('touchstart touchmove touchend', touchEvent);
        canvas.ontouchstart = canvas.ontouchmove = canvas.ontouchend = touchEvent;
        $canvas.on('contextmenu', function(evt) {
            // block right-mouse menu over canvas
            evt.preventDefault();
            return false;
        });

        $app.on('click', '.command.game-new', puzzle.newGame);
        $app.on('click', '.command.game-restart', puzzle.restartGame);
        $app.on('click', '.command.game-solve', puzzle.solve);
        $app.on('click', '.command.undo', puzzle.undo);
        $app.on('click', '.command.redo', puzzle.redo);

        $(".keyboard").on('click', 'button', virtualKeyboardPress);

        // Handle window resize... after it settles down
        var resizeTimer = null,
            resizeDelay = 200;
        $(window).on('resize', function() {
            if (resizeTimer) {
                clearTimeout(resizeTimer);
                resizeTimer = null;
            }
            resizeTimer = setTimeout(function() {
                resizeTimer = null;
                puzzle.resize();
            }, resizeDelay);
        });
    }

    return {
        initEvents: initEvents
    };

})(jQuery);
