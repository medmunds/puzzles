// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.


(function($) {
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
    var midend_new_game,
        midend_restart_game,
        midend_redraw,
        midend_process_key,
        midend_timer,
        midend_wants_statusbar,
        midend_solve,
        midend_status,
        midend_can_undo,
        midend_can_redo;

    $(function() {
        midend_new_game = Module.cwrap('midend_new_game', 'void', ['number']);
        midend_restart_game = Module.cwrap('midend_restart_game', 'void', ['number']);
        midend_redraw = Module.cwrap('midend_redraw', 'void', ['number']);
        midend_process_key = Module.cwrap('midend_process_key',
            'number', ['number', 'number', 'number', 'number']);
        midend_timer = Module.cwrap('midend_timer', 'void', ['number', 'number']);
        midend_wants_statusbar = Module.cwrap('midend_wants_statusbar', 'number', ['number']);
        midend_solve = Module.cwrap('midend_solve', 'string', ['number']);
        midend_status = Module.cwrap('midend_status', 'number', ['number']);
        midend_can_undo = Module.cwrap('midend_can_undo', 'number', ['number']);
        midend_can_redo = Module.cwrap('midend_can_redo', 'number', ['number']);
    });


    function Frontend(canvas_id, status_id) {
        if (!(this instanceof Frontend)) {
            return new Frontend(canvas_id, status_id);
        }
        this.animationId = false;
        this.lastAnimationTime = 0;
        this.drawing = null;
        this.midend = null;

        this.chandle = CHandle(this);

        this.$canvas = $('#'+canvas_id);
        this.$status = $('#'+status_id);
        this._initEvents();
    }

    Frontend.prototype = {
        set_midend: function(midend) {
            this.midend = midend;
        },
        get_midend: function() {
            return this.midend;
        },

        newGame: function() {
            midend_new_game(this.midend);
            midend_redraw(this.midend);
        },
        restartGame: function() {
            midend_restart_game(this.midend);
        },
        solve: function() {
            midend_solve(this.midend);
        },
        undo: function() {
            midend_process_key(this.midend, -1, -1, 'u'.charCodeAt(0));
        },
        redo: function() {
            midend_process_key(this.midend, -1, -1, 'r'.charCodeAt(0));
        },

        activate_timer: function() {
            if (!this.animationId) {
                this.lastAnimationTime = Date.now();
                this.animationId = window.requestAnimationFrame(this._animationEvent.bind(this));
            }
        },
        deactivate_timer: function() {
            if (this.animationId) {
                window.cancelAnimationFrame(this.animationId); // TODO: non-portable
                this.animationId = null;
            }
        },
        _animationEvent: function(timestamp) {
            var now = Date.now(),
                seconds = (now - this.lastAnimationTime) / 1000;
            this.lastAnimationTime = now;
            this.animationId = window.requestAnimationFrame(this._animationEvent.bind(this));
            midend_timer(this.midend, seconds);
        },

        get_drawing: function() {
            if (!this.drawing) {
                this.drawing = new Drawing(this.$canvas, this.$status);
            }
            return this.drawing;
        },


        _mouseEvent: function(evt) {
            if (evt.which === 0) {
                // mouse moving over canvas with no button down -- game doesn't care
                return undefined;
            }

            var x = evt.offsetX,
                y = evt.offsetY;
            if (x === undefined) {
                var targetOffset = $(evt.target).offset();
                x = evt.pageX - targetOffset.left;
                y = evt.pageY - targetOffset.top;
            }
            var button = mouseEventMap[evt.type] + evt.which - 1; // which: 1,2,3 left,mid,right
            if (evt.ctrlKey)
                button |= MOD_CTRL;
            if (evt.shiftKey)
                button |= MOD_SHFT;
            midend_process_key(this.midend, x, y, button);
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
            return retval;
        },

        _initEvents: function() {
            $(document).on('keydown keypress', this._keyEvent.bind(this));
            this.$canvas.on('mousedown mousemove mouseup', this._mouseEvent.bind(this));
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
//        },
//        js_mark_current_preset: function(index) {
//        },
//
//        js_init_game: function(name, can_configure, wants_statusbar, can_solve) {
//            name = Pointer_stringify(name);
//        }

})(jQuery);
