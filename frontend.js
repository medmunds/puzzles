// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.

(function() {

    mergeInto(LibraryManager.library, {
        frontend_new: function() {
            console.log('frontend_new');
            return {
                obj: 'frontend',
                timer_active: false,
                midend: null
            };
        },
        frontend_set_midend: function(fe, me) {
            console.log('frontend_set_midend', fe, me);
            fe.midend = me;
        },
        frontend_get_midend: function(fe) {
            console.log('frontend_get_midend', fe);
            return fe.midend;
        },

        activate_timer: function(fe) {
            console.log('activate_timer', fe);
            if (!fe.timer_active) {
                fe.timer_active = true;
                fe.last_time = new Date().getTime();

                // TODO: set getAnimationFrame
            }
        },
        deactivate_timer: function(fe) {
            console.log('deactivate_timer', fe);
            if (fe.timer_active) {
                fe.timer_active = false;

                // TODO: disable getAnimationFrame
            }
        },

        // Drawing API
        canvas_new: function() {
            console.log('canvas_new');
            var canvas = document.getElementById("canvas");
            return {obj: 'canvas', canvas: canvas, palette: []};
        },
        canvas_set_palette_entry: function(dh, index, r, g, b) {
            console.log('canvas_set_palette_entry', dh, index, r, g, b);
            dh.palette[index] = 'rgb(' + [r,g,b].join(',') + ')';
        },
        canvas_status_bar: function(dh, text) {
            text = Pointer_stringify(text);
            console.log('canvas_status_bar', dh, text);
        },
        canvas_start_draw: function(dh) {
            console.log('canvas_start_draw', dh);
        },
        canvas_clip: function(dh, x, y, w, h) {
            console.log('canvas_clip', dh, x, y, w, h);
        },
        canvas_unclip: function(dh) {
            console.log('canvas_unclip', dh);
        },
        canvas_draw_text: function(dh, x, y, fonttype, fontsize, align, colour, text) {
            text = Pointer_stringify(text);
            // from puzzles.h:
            var ALIGN_VNORMAL = 0x000,
                ALIGN_VCENTRE = 0x100,
                ALIGN_HLEFT   = 0x000,
                ALIGN_HCENTRE = 0x001,
                ALIGN_HRIGHT  = 0x002;
            var FONT_FIXED    = 0,
                FONT_VARIABLE = 1;
            console.log('canvas_draw_text', dh, x, y, fonttype, fontsize, align, colour, text);
        },
        canvas_draw_rect: function(dh, x, y, w, h, colour) {
            console.log('canvas_draw_rect', dh, x, y, w, h, colour);
        },
        canvas_draw_line: function(dh, x1, y1, x2, y2, colour) {
            console.log('canvas_draw_line', dh, x1, y1, x2, y2, colour);
        },
        canvas_draw_poly: function(dh, /* int* */_coords, npoints, fillcolour, outlinecolour) {
            // C to JS array:
            var coords = [];
            for (var n = npoints; n > 0; n--) {
                coords.push(getValue(_coords, 'i16*'));
                _coords += 2; // sizeof(int)
            }
            console.log('canvas_draw_poly', dh, coords, npoints, fillcolour, outlinecolour);
        },
        canvas_draw_circle: function(dh, cx, cy, radius, fillcolour, outlinecolour) {
            console.log('canvas_draw_circle', dh, cx, cy, radius, fillcolour, outlinecolour);
        },
        canvas_draw_update: function(dh, x, y, w, h) {
            console.log('canvas_draw_update', dh, x, y, w, h);
        },
        canvas_blitter_new: function(dh, w, h) {
            console.log('canvas_blitter_new', dh, w, h);
            return {obj: "blitter", width: w, height: h};
        },
        canvas_blitter_free: function(dh, bl) {
            console.log('canvas_blitter_free', dh, bl);
        },
        canvas_blitter_save: function(dh, bl, x, y) {
            console.log('canvas_blitter_save', dh, bl, x, y);
        },
        canvas_blitter_load: function(dh, bl, x, y) {
            // from puzzles.h:
            var BLITTER_FROMSAVED = (-1);
            if (x == BLITTER_FROMSAVED && y == BLITTER_FROMSAVED) {
                x = bl.x;
                y = bl.y;
            }
            console.log('canvas_blitter_load', dh, bl, x, y);
        },
        canvas_end_draw: function(dh) {
            console.log('canvas_end_draw', dh);
        },

        //
        // Events
        //


        //
        // Game Options
        //


        //
        // Game Controls
        //
        js_resize_fe: function(x, y) {
            console.log('js_resize_fe', x, y);
        },

        js_add_preset: function(name, params) {
            name = Pointer_stringify(name);
            console.log('js_add_preset', name, params);
        },
        js_mark_current_preset: function(index) {
            console.log('js_mark_current_preset', index);
        },

        js_init_game: function(name, can_configure, wants_statusbar, can_solve) {
            name = Pointer_stringify(name);
            console.log('js_init_game', name, can_configure, wants_statusbar, can_solve);
        }
    });

})();
