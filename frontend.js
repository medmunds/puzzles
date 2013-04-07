// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.


(function($, globalScope) {
    "use strict";

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

    var mouseEventMap = {
        'mousedown': LEFT_BUTTON,
        'mousemove': LEFT_DRAG,
        'mouseup': LEFT_RELEASE
    };

    // C Imports (can't init until game loaded)
    var init_game,
        midend_new_game,
        midend_restart_game,
        midend_set_params,
        midend_get_params,
        midend_size,
        midend_redraw,
        midend_force_redraw,
        midend_process_key,
        midend_timer,
        midend_which_preset,
        midend_wants_statusbar,
        midend_solve,
        midend_status,
        midend_can_undo,
        midend_can_redo;

    function initCImports() {
        if (init_game){
            return;
        }
        init_game = Module.cwrap('init_game', 'void', ['number', 'number']);
        midend_new_game = Module.cwrap('midend_new_game', 'void', ['number']);
        midend_restart_game = Module.cwrap('midend_restart_game', 'void', ['number']);
        midend_set_params = Module.cwrap('midend_set_params', 'void', ['number', 'number']);
        midend_get_params = Module.cwrap('midend_get_params', 'number', ['number']);
        midend_size = Module.cwrap('midend_size', 'void', ['number', 'number', 'number', 'number']);
        midend_redraw = Module.cwrap('midend_redraw', 'void', ['number']);
        midend_force_redraw = Module.cwrap('midend_force_redraw', 'void', ['number']);
        midend_process_key = Module.cwrap('midend_process_key',
            'number', ['number', 'number', 'number', 'number']);
        midend_timer = Module.cwrap('midend_timer', 'void', ['number', 'number']);
        midend_which_preset = Module.cwrap('midend_which_preset', 'number', ['number']);
        midend_wants_statusbar = Module.cwrap('midend_wants_statusbar', 'number', ['number']);
        midend_solve = Module.cwrap('midend_solve', 'string', ['number']);
        midend_status = Module.cwrap('midend_status', 'number', ['number']);
        midend_can_undo = Module.cwrap('midend_can_undo', 'number', ['number']);
        midend_can_redo = Module.cwrap('midend_can_redo', 'number', ['number']);
    }


    function Frontend(canvas_id, status_id) {
        if (!(this instanceof Frontend)) {
            return new Frontend(canvas_id, status_id);
        }
        initCImports();

        this.animationId = false;
        this.lastAnimationTime = 0;
        this.midend = null;

        this.$canvas = $('#'+canvas_id);
        this.canvas = this.$canvas.get(0);
        this.$status = $('#'+status_id);

        this.drawing = new Drawing(this.$canvas, this.$status);

        init_game(CHandle(this), CHandle(this.drawing));

        this._initEvents();
    }

    Frontend.prototype = {

        //
        // Controls
        //

        newGame: function() {
            var msg = Message('#loading');
            msg.shown(function() {
                midend_new_game(this.midend);
                midend_redraw(this.midend);
                this._updateControlState();
                msg.hide();
            }.bind(this));
            msg.show();
        },
        restartGame: function() {
            midend_restart_game(this.midend);
            this._updateControlState();
        },
        solve: function() {
            midend_solve(this.midend);
            this._updateControlState();
        },
        undo: function() {
            midend_process_key(this.midend, -1, -1, 'u'.charCodeAt(0));
            this._updateControlState();
        },
        redo: function() {
            midend_process_key(this.midend, -1, -1, 'r'.charCodeAt(0));
            this._updateControlState();
        },

        _updateControlState: function() {
            var canUndo = !!midend_can_undo(this.midend),
                canRedo = !!midend_can_redo(this.midend),
                status = midend_status(this.midend);

            $("#game_solve").prop('disabled', (status !== 0));
            $("#undo").prop('disabled', !canUndo);
            $("#redo").prop('disabled', !canRedo);
        },


        //
        //
        //

        _calcMaxCanvasSize: function() {
            var $app = $('.app'),
                $game = this.$canvas.parent(),
                $keyboard = $(".keyboard");

            var gameBorder = $game.outerWidth(true) - $game.width(),
                availableWidth = $app.width() - gameBorder;

            //availableWidth -= 32; // in case we pick up a vertical scrollbar
            var minWidth = parseInt(this.$canvas.css('min-width'));
            if (minWidth) {
                availableWidth = Math.max(minWidth, availableWidth);
            }

            var windowHeight = $(window).height(),
                appBottom = $app.offset().top + $app.outerHeight(true), // in page coords, including margin
                availableHeight = windowHeight - appBottom; // reserve space for the whole app (and above)

            availableHeight += this.$canvas.height(); // what canvas is currently using is available
            if (!this.hasStatusBar && this.$status.is(":visible")) { // e.g., during initial load
                availableHeight += this.$status.outerHeight();
            }
            if (!this.usesNumpad && $keyboard.is(":visible")) {
                availableHeight += $keyboard.outerHeight(); // e.g., during initial load
            }
            var minHeight = parseInt(this.$canvas.css('min-height'));
            if (minHeight) {
                availableHeight = Math.max(minHeight, availableHeight);
            }

            return { width: availableWidth, height: availableHeight };
        },

        resize: function() {
            var target = this._calcMaxCanvasSize();

            //console.log("Target size: " + target.width + "x" + target.height);

            var type = 'i32',
                wptr = allocate([target.width], type, ALLOC_STACK),
                hptr = allocate([target.height], type, ALLOC_STACK);
            midend_size(this.midend, wptr, hptr, /*usersize=*/true);

            var w = getValue(wptr, type),
                h = getValue(hptr, type);

            //console.log("Negotized size: " + w + "x" + h);

            this.drawing.resize(w, h);
            // don't force_redraw here -- not necessary, and can cause big memory mess
            midend_redraw(this.midend);
        },

        activate_timer: function() {
            if (!this.animationId) {
                this.lastAnimationTime = Date.now();
                this.animationId = requestAnimationFrame(this._animationEvent.bind(this));
            }
        },
        deactivate_timer: function() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        },
        _animationEvent: function(timestamp) {
            var now = Date.now(),
                seconds = (now - this.lastAnimationTime) / 1000;
            this.lastAnimationTime = now;
            this.animationId = requestAnimationFrame(this._animationEvent.bind(this));
            midend_timer(this.midend, seconds);
        },

        set_game_info: function(
            midend, name, can_configure, can_solve, can_format_as_text_ever,
            wants_statusbar, is_timed, require_rbutton, require_numpad)
        {
            this.midend = midend;
            this.gameName = name;
            this.configurable = !!can_configure;
            this.solveable = !!can_solve;
            this.saveable = !!can_format_as_text_ever;
            this.hasStatusBar = !!wants_statusbar;
            this.isTimed = !!is_timed;
            this.usesRightButton = !!require_rbutton;
            this.usesNumpad = !!require_numpad;

            this.$status.toggle(this.hasStatusBar);

            $('h1').text(this.gameName);
            $('.keyboard').toggle(this.usesNumpad);
            $("#game_solve").toggle(this.solveable);
        },

        default_colour: function(/* float* */colourptr) {
            var bgcolor = this.$canvas.css('background-color'),
                parsed = bgcolor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i),
                rgb = [0.8, 0.8, 0.8];
            if (parsed && parsed.length === 4) {
                parsed.shift(); // pop full match
                rgb = parsed.map(function(clr) {
                    return parseInt(clr) / 255.0;
                });
            }
            // Write it back to C
            var type = 'float',
                size = Runtime.getNativeTypeSize(type);
            setValue(colourptr, rgb[0], type); colourptr += size;
            setValue(colourptr, rgb[1], type); colourptr += size;
            setValue(colourptr, rgb[2], type);
        },

        //
        // Presets and Configs
        //

        add_preset: function(name, paramsptr) {
            this.presets = this.presets || [];
            this.presets.push({
                name: name,
                value: paramsptr
            });
        },

        _buildPresetsMenu: function($menu) {
            if (!this.presets) {
                return;
            }
            $menu.empty();
            this.presets.forEach(function(preset) {
                $('<option>')
                    .text(preset.name)
                    .attr('value', preset.value)
                    .appendTo($menu);
            });

            var current = midend_which_preset(this.midend);
            if (current >= 0) {
                $menu.val(this.presets[current].value);
            } // else custom config
        },

        _choosePreset: function(paramsptr) {
            midend_set_params(this.midend, paramsptr);
            this.resize();
            this.newGame();
        },

        //
        // Events
        //

        _mouseEvent: function(evt) {
            if (evt.which === 0) {
                // mouse moving over canvas with no button down -- game doesn't care
                return undefined;
            }

            var x = evt.offsetX,
                y = evt.offsetY;
            if (x === undefined || evt.target !== this.canvas) {
                // Firefox doesn't supply offsetX,Y
                // IE does, but they're relative to excanvas's VML shapes (rather than the canvas)
                if (evt.type === "mousedown") {
                    // Cache offset for duration of mouse drag sequence
                    this.canvasOffset = this.$canvas.offset();
                }
                x = evt.pageX - this.canvasOffset.left;
                y = evt.pageY - this.canvasOffset.top;
            }
            var button = mouseEventMap[evt.type] + evt.which - 1; // which: 1,2,3 left,mid,right
            if (evt.ctrlKey)
                button |= MOD_CTRL;
            if (evt.shiftKey)
                button |= MOD_SHFT;
            midend_process_key(this.midend, x, y, button);
            if (evt.type == "mouseup") {
                this._updateControlState();
            }
            return false;
        },

        _touchEvent: function(evt) {
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
                currentTarget: this.canvas,
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
            this.$canvas.trigger(mouseEvent);

            return false;
        },

        _keyEvent: function(evt) {
            var button, retval;

            button = evt.which;
            if (evt.type != "keypress") {
                // Arrows and other non-ASCII keys
                button = keymap[evt.which];
            }

            if (button) {
                midend_process_key(this.midend, -1, -1, button);
                evt.preventDefault();
                retval = false;
            }
            this._updateControlState();
            return retval;
        },

        _virtualKeyboardPress: function(evt) {
            var $button = $(evt.target),
                keycode = $button.attr('data-key'),
                key;

            if (keycode) {
                key = parseInt(keycode);
            } else {
                key = $button.text().charCodeAt(0);
            }
            if (key) {
                midend_process_key(this.midend, -1, -1, key);
                this._updateControlState();
            }
        },

        _initEvents: function() {
            $(document).on('keydown keypress', this._keyEvent.bind(this));
            this.$canvas.on('mousedown mousemove mouseup', this._mouseEvent.bind(this));
            // jQuery 2 seems to have a bug accessing undefined objects in touch events
            //this.$canvas.on('touchstart touchmove touchend', this._touchEvent.bind(this));
            this.canvas.ontouchstart = this.canvas.ontouchmove =
                this.canvas.ontouchend = this._touchEvent.bind(this);
            this.$canvas.on('contextmenu', function(evt) {
                // block right-mouse menu over canvas
                evt.preventDefault();
                return false;
            });

            $("#game_new").click(this.newGame.bind(this));
            $("#game_restart").click(this.restartGame.bind(this));
            $("#game_solve").click( this.solve.bind(this));
            $("#undo").click(this.undo.bind(this));
            $("#redo").click(this.redo.bind(this));

            $(".keyboard").on('click', 'button', this._virtualKeyboardPress.bind(this));

            var $menu = $('#game_preset_menu');
            this._buildPresetsMenu($menu);
            $menu.on('change', function() {
                this._choosePreset($menu.val());
            }.bind(this));

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
                    this.resize();
                }.bind(this), resizeDelay);
            }.bind(this));
        }
    };

    Module.export_to_c(Frontend.prototype.activate_timer, 'activate_timer', 'void', ['handle']);
    Module.export_to_c(Frontend.prototype.deactivate_timer, 'deactivate_timer', 'void', ['handle']);
    Module.export_to_c(Frontend.prototype.set_game_info, 'frontend_set_game_info', 'void',
        ['handle', 'number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Frontend.prototype.add_preset, 'frontend_add_preset', 'void',
        ['handle', 'string', 'number']);
    Module.export_to_c(Frontend.prototype.default_colour, 'frontend_default_colour', 'void',
        ['handle', 'number']);

    // Exports

    globalScope.Frontend = Frontend;


})(jQuery, window);


var Message = (function($) {
    "use strict";

    function Message(selector) {
        var $msg = $(selector),
            $backdrop = $msg.parent(),
            shown = function() {};

        return {
            show: function() {
                $backdrop.css('display', 'block');
                $msg.css('display', 'inline-block');
                setTimeout(shown, 5);
            },
            hide: function() {
                $msg.hide();
                $backdrop.hide();
            },
            shown: function(f) {
                shown = f;
            }
        }
    }

    return Message;
})(jQuery);
