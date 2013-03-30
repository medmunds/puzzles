// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.


(function() {
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


    // from Keys.js
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
    keymap[VK_SPACE] = CURSOR_SELECT;
    keymap[VK_RETURN] = CURSOR_SELECT;
    keymap[VK_BACK_SPACE] = CURSOR_SELECT2;
    keymap[VK_DELETE] = CURSOR_SELECT2;


    // C Imports (can't init until game loaded)
    var handle_input, midend_timer;


    function Frontend(canvas_id, status_id) {
        if (!(this instanceof Frontend)) {
            return new Frontend(canvas_id, status_id);
        }
        this.animationId = false;
        this.lastAnimationTime = 0;
        this.drawing = null;
        this.midend = null;

        this.chandle = CHandle(this);

        this.canvas = document.getElementById(canvas_id);
        this.status = document.getElementById(status_id);
        this._initEvents();

        handle_input = Module.cwrap('handle_input',
            'number', ['number', 'number', 'number', 'number']);
        midend_timer = Module.cwrap('midend_timer', 'void', ['number', 'number']);
    }

    Frontend.prototype = {
        set_midend: function(midend) {
            this.midend = midend;
        },

        get_midend: function() {
            return this.midend;
        },

        activate_timer: function() {
            if (!this.animationId) {
                console.log("activate_timer");
                this.lastAnimationTime = Date.now();
                this.animationId = window.requestAnimationFrame(this._animationEvent.bind(this));
            }
        },
        deactivate_timer: function() {
            if (this.animationId) {
                console.log("deactivate_timer");
                window.cancelAnimationFrame(this.animationId); // TODO: non-portable
                this.animationId = null;
            }
        },
        _animationEvent: function(timestamp) {
            var now = Date.now(),
                seconds = (now - this.lastAnimationTime) / 1000;
            this.lastAnimationTime = now;
            this.animationId = window.requestAnimationFrame(this._animationEvent.bind(this));
            //console.log("timer", seconds);
            midend_timer(this.midend, seconds);
        },

        get_drawing: function() {
            if (!this.drawing) {
                console.log("creating drawing");
                this.drawing = new Drawing(this.canvas, this.status);
            }
            return this.drawing;
        },


        _mouseEvent: function(evt, mouseType) {
            var x = evt.offsetX, // TODO: non-portable
                y = evt.offsetY,
                button = evt.button + mouseType; // evt.button = 0,1,2 left,mid,right
            if (evt.ctrlKey)
                button |= MOD_CTRL;
            if (evt.shiftKey)
                button |= MOD_SHFT;
            handle_input(this.chandle, x, y, button);
        },

        _keyEvent: function(evt) {
            if (evt.ctrlKey || evt.metaKey) {
                return undefined;
            }

            var key = evt.key || evt.keyCode || evt.which, // TODO: non-portable
                button = keymap[key] || key;
            if (evt.ctrlKey)
                button |= MOD_CTRL;
            if (evt.shiftKey)
                button |= MOD_SHFT;
            handle_input(this.chandle, 0, 0, button);
            evt.preventDefault();
            return false;
        },

        _initEvents: function() {
            var self = this;

            this.canvas.onmousedown = function(evt) {
                self._mouseEvent(evt, LEFT_BUTTON);
                return false;
            };
            this.canvas.onmousemove = function(evt) {
                self._mouseEvent(evt, LEFT_DRAG);
                return false;
            };
            this.canvas.onmouseup = function(evt) {
                self._mouseEvent(evt, LEFT_RELEASE);
                return false;
            };
            this.canvas.oncontextmenu = function(evt) {
                evt.preventDefault();
                return false;
            };

            window.onkeydown = this._keyEvent.bind(this);
        }
    };

    Module.export_to_c(Frontend.prototype.set_midend, 'frontend_set_midend', 'void', ['handle', 'number']);
    Module.export_to_c(Frontend.prototype.get_midend, 'frontend_get_midend', 'number', ['handle']);
    Module.export_to_c(Frontend.prototype.activate_timer, 'activate_timer', 'void', ['handle']);
    Module.export_to_c(Frontend.prototype.deactivate_timer, 'deactivate_timer', 'void', ['handle']);
    Module.export_to_c(Frontend.prototype.get_drawing, 'frontend_get_drawing', 'handle', ['handle']);

    // Exports

    window.Frontend = Frontend;


        //
        // Game Controls
        //
//        js_add_preset: function(name, params) {
//            name = Pointer_stringify(name);
//            console.log('js_add_preset', name, params);
//        },
//        js_mark_current_preset: function(index) {
//            console.log('js_mark_current_preset', index);
//        },
//
//        js_init_game: function(name, can_configure, wants_statusbar, can_solve) {
//            name = Pointer_stringify(name);
//            console.log('js_init_game', name, can_configure, wants_statusbar, can_solve);
//        }

})();
