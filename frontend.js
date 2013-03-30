// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.


(function() {
    "use strict";

    function Frontend(canvas_id) {
        if (!(this instanceof Frontend)) {
            return new Frontend(canvas_id);
        }
        this.canvas_id = canvas_id;
        this.timer_active = false;
        this.drawing = null;
        this.midend = null;

        this.canvas = document.getElementById(this.canvas_id);
    }

    Frontend.prototype = {
        set_midend: function(midend) {
            this.midend = midend;
        },

        get_midend: function() {
            return this.midend;
        },

        activate_timer: function() {
            console.log("activate_timer");
            if (!this.timer_active) {
                this.timer_active = true;
            }
        },
        deactivate_timer: function() {
            console.log("deactivate_timer");
            if (this.timer_active) {
                this.timer_active = false;
            }
        },

        get_drawing: function() {
            if (!this.drawing) {
                console.log("creating drawing");
                this.drawing = new Drawing(this.canvas);
            }
            return this.drawing;
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
