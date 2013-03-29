// frontend.js
// JavaScript (HTML/canvas) frontend for Simon Tatham's puzzle collection.
// See http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/intro.html#intro-frontend.
// Works with mid-end and backend code cross-compiled to JS using emscripten.

(function() {

    mergeInto(LibraryManager.library, {
        frontend_new: function() {
            console.log('frontend_new');
            var fe = {
                obj: 'frontend',
                timer_active: false,
                midend: null
            };
            globalScope.fe = fe;
            return fe;
        },
        frontend_set_midend: function(fe, me) {
            fe = globalScope.fe;
            console.log('frontend_set_midend', me);
            fe.midend = me;
        },
        frontend_get_midend: function(fe) {
            fe = globalScope.fe;
            console.log('frontend_get_midend');
            return fe.midend;
        },

        activate_timer: function(fe) {
            fe = globalScope.fe;
            console.log('activate_timer');
            if (!fe.timer_active) {
                fe.timer_active = true;
                fe.last_time = new Date().getTime();

                // TODO: set getAnimationFrame
            }
        },
        deactivate_timer: function(fe) {
            fe = globalScope.fe;
            console.log('deactivate_timer');
            if (fe.timer_active) {
                fe.timer_active = false;

                // TODO: disable getAnimationFrame
            }
        },

        // Drawing API
        canvas_new: function() {
            console.log('canvas_new');
            var dr = Drawing();
            globalScope.dr = dr;
            return dr;
        },
        canvas_set_palette_entry: function(dr, index, r, g, b) {
            dr = globalScope.dr;
            console.log('canvas_set_palette_entry', index, r, g, b);
            dr.set_palette_entry(index, r, g, b);
        },
        canvas_status_bar: function(dr, text) {
            dr = globalScope.dr;
            text = Pointer_stringify(text);
            console.log('canvas_status_bar', text);
            window.status = text;
        },
        canvas_start_draw: function(dr) {
            dr = globalScope.dr;
            console.log('canvas_start_draw');
        },
        canvas_clip: function(dr, x, y, w, h) {
            dr = globalScope.dr;
            console.log('canvas_clip', x, y, w, h);
            dr.clip(x, y, w, h);
        },
        canvas_unclip: function(dr) {
            dr = globalScope.dr;
            console.log('canvas_unclip');
            dr.unclip();
        },
        canvas_draw_text: function(dr, x, y, fonttype, fontsize, align, colour, text) {
            dr = globalScope.dr;
            text = Pointer_stringify(text);
            // from puzzles.h:
            var ALIGN_VNORMAL = 0x000,
                ALIGN_VCENTRE = 0x100,
                ALIGN_HLEFT   = 0x000,
                ALIGN_HCENTRE = 0x001,
                ALIGN_HRIGHT  = 0x002;
            var FONT_FIXED    = 0,
                FONT_VARIABLE = 1;
            console.log('canvas_draw_text', x, y, fonttype, fontsize, align, colour, text);

            var valign = (align & ALIGN_VCENTRE) == ALIGN_VCENTRE ? "middle" : "top",
                halign = (align & ALIGN_HCENTRE) == ALIGN_HCENTRE ? "center" : (
                    (align & ALIGN_HRIGHT) == ALIGN_HRIGHT ? "right" : "left"
                    ),
                proportional = fonttype == FONT_VARIABLE;
            dr.draw_text(x, y, proportional, fontsize, valign, halign, colour, text);
        },
        canvas_draw_rect: function(dr, x, y, w, h, colour) {
            dr = globalScope.dr;
            console.log('canvas_draw_rect', x, y, w, h, colour);
            dr.draw_rect(x, y, w, h, colour);
        },
        canvas_draw_line: function(dr, x1, y1, x2, y2, colour) {
            dr = globalScope.dr;
            console.log('canvas_draw_line', x1, y1, x2, y2, colour);
            dr.draw_line(x1, y1, x2, y2, 1, colour);
        },
        canvas_draw_thick_line: function(dr, thickness, x1, y1, x2, y2, colour) {
            dr = globalScope.dr;
            console.log('canvas_draw_thick_line', thickness, x1, y1, x2, y2, colour);
            dr.draw_line(x1, y1, x2, y2, thickness, colour);
        },
        canvas_draw_poly: function(dr, /* int* */_coords, npoints, fillcolour, outlinecolour) {
            dr = globalScope.dr;
            // Convert C array to JS array of {x,y} objects
            var coords = [],
                sizeofint = Runtime.getNativeTypeSize('i32');
            for (var n = npoints; n > 0; n--) {
                var x = getValue(_coords, 'i32*');
                _coords += sizeofint;
                var y = getValue(_coords, 'i32*');
                _coords += sizeofint;
                coords.push({'x': x, 'y': y});
            }
            console.log('canvas_draw_poly', coords, npoints, fillcolour, outlinecolour);
            dr.draw_poly(coords, fillcolour, outlinecolour);
        },
        canvas_draw_circle: function(dr, cx, cy, radius, fillcolour, outlinecolour) {
            dr = globalScope.dr;
            console.log('canvas_draw_circle', cx, cy, radius, fillcolour, outlinecolour);
            dr.draw_circle(cx, cy, radius, fillcolour, outlinecolour);
        },
        canvas_draw_update: function(dr, x, y, w, h) {
            dr = globalScope.dr;
            console.log('canvas_draw_update', x, y, w, h);
        },
        canvas_blitter_new: function(dr, w, h) {
            dr = globalScope.dr;
            console.log('canvas_blitter_new', w, h);
            return {obj: "blitter", width: w, height: h};
        },
        canvas_blitter_free: function(dr, bl) {
            dr = globalScope.dr;
            console.log('canvas_blitter_free', bl);
        },
        canvas_blitter_save: function(dr, bl, x, y) {
            dr = globalScope.dr;
            console.log('canvas_blitter_save', bl, x, y);
        },
        canvas_blitter_load: function(dr, bl, x, y) {
            dr = globalScope.dr;
            // from puzzles.h:
            var BLITTER_FROMSAVED = (-1);
            if (x == BLITTER_FROMSAVED && y == BLITTER_FROMSAVED) {
                x = bl.x;
                y = bl.y;
            }
            console.log('canvas_blitter_load', bl, x, y);
        },
        canvas_end_draw: function(dr) {
            dr = globalScope.dr;
            console.log('canvas_end_draw');
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
            globalScope.dr.resize(x, y);
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
