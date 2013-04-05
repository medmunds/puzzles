(function($, globalScope) {
    "use strict";

    // from puzzles.h:
    var ALIGN_VNORMAL = 0x000, // alphabetic baseline
        ALIGN_VCENTRE = 0x100,
        ALIGN_HLEFT   = 0x000,
        ALIGN_HCENTRE = 0x001,
        ALIGN_HRIGHT  = 0x002;
    var FONT_FIXED    = 0,
        FONT_VARIABLE = 1;
    var BLITTER_FROMSAVED = (-1);

    function hex(i) {
        return ("0" + i.toString(16)).slice(-2);
    }
    function rgb2hex(r, g, b) {
        return '#' + hex(r) + hex(g) + hex(b);
    }

    function Drawing(canvas, status) {
        if (!(this instanceof Drawing)) {
            return new Drawing(canvas, status);
        }

        this.$canvas = $(canvas);
        this.context = this.$canvas[0].getContext("2d");
        this.palette = [];

        this.$status = $(status);

        this.qx = this.qy = 0.5; // adjust lines onto pixels
        this.defaultLineWidth = 1;
    }

    Drawing.prototype = {
        set_palette_entry: function(index, r, g, b) {
            this.palette[index] = rgb2hex(r, g, b);
        },
        status_bar: function(text) {
            this.$status.text(text);
        },

        resize: function(w, h) {
            var canvas = this.$canvas.get(0);
            canvas.width = w + 2*this.qx;
            canvas.height = h + 2*this.qy;
        },

        start_draw: function() {
        },
        draw_update: function(x, y, w, h) {
        },
        end_draw: function() {
        },

        clip: function(x, y, w, h) {
            this.context.save();
            this.context.beginPath();
            this.context.rect(x, y, w+2*this.qx, h+2*this.qy);
            this.context.clip();
        },
        unclip: function() {
            this.context.restore();
        },

        draw_text: function(x, y, fonttype, fontsize, align, colour, text) {
            var valign = (align & ALIGN_VCENTRE) == ALIGN_VCENTRE ? "middle" : "alphabetic",
                halign = (align & ALIGN_HCENTRE) == ALIGN_HCENTRE ? "center"
                    : ((align & ALIGN_HRIGHT) == ALIGN_HRIGHT ? "right" : "left"),
                fontfamily = (fonttype == FONT_VARIABLE) ? "Arial" : "fixed";
            this.context.font = "bold " + fontsize + "px " + fontfamily;
            this.context.textBaseline = valign;
            this.context.textAlign = halign;
            this.context.fillStyle = this.palette[colour];
            this.context.fillText(text, x+this.qx, y+this.qy);
        },
        draw_rect: function(x, y, w, h, colour) {
            this.context.lineWidth = 0;
            this.context.fillStyle = this.palette[colour];
            this.context.fillRect(x+this.qx, y+this.qy, w, h);
        },
        draw_line: function(x1, y1, x2, y2, colour) {
            this.draw_thick_line(this.defaultLineWidth, x1, y1, x2, y2, colour);
        },
        draw_thick_line: function(thickness, x1, y1, x2, y2, colour) {
            this.context.beginPath();
            this.context.moveTo(x1+this.qx, y1+this.qy);
            this.context.lineTo(x2+this.qx, y2+this.qy);
            this._fillAndStroke(-1, colour, thickness);
        },
        draw_poly: function(/* int* */coords, npoints, fillcolour, outlinecolour) {
            coords = Module.c_to_js_array(coords, npoints*2, 'i32');
            this.context.beginPath();
            var i = 0,
                x = coords[i++],
                y = coords[i++];
            this.context.moveTo(x+this.qx, y+this.qy);
            while (i < coords.length) {
                x = coords[i++];
                y = coords[i++];
                this.context.lineTo(x+this.qx, y+this.qy);

            }
            this._fillAndStroke(fillcolour, outlinecolour);
        },
        draw_circle: function(cx, cy, radius, fillcolour, outlinecolour) {
            this.context.beginPath();
            this.context.arc(cx+this.qx, cy+this.qy, radius, 0, Math.PI * 2, false);
            this.context.closePath();
            this._fillAndStroke(fillcolour, outlinecolour);
        },

        blitter_new: function(w, h) {
            return {
                'type': "blitter",
                drawing: this,
                w: w,
                h: h,
                free: function() {} // gets replaced if wrapped as CHandle
            };
        },
        blitter_free: function(blitter) {
            blitter.drawing = null;
            blitter.free();
        },
        blitter_save: function(blitter, x, y) {
            blitter.x = x;
            blitter.y = y;
            blitter.data = this.context.getImageData(x, y, blitter.w, blitter.h);
        },
        blitter_load: function(blitter, x, y) {
            x = (x == BLITTER_FROMSAVED) ? blitter.x : x;
            y = (y == BLITTER_FROMSAVED) ? blitter.y : y;
            this.context.putImageData(blitter.data, x, y);
        },

        _fillAndStroke: function(fillcolour, strokecolour, linewidth) {
            if (linewidth === undefined) {
                linewidth = this.defaultLineWidth;
            }
            this.context.strokeStyle = this.palette[strokecolour];
            this.context.lineWidth = linewidth;
            if (fillcolour >= 0) {
                this.context.fillStyle = this.palette[fillcolour];
                this.context.fill();
            }
            this.context.stroke();
        }
    };


    Module.export_to_c(Drawing.prototype.set_palette_entry, 'canvas_set_palette_entry',
        'void', ['handle', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.status_bar, 'canvas_status_bar',
        'void', ['handle', 'string']);

    Module.export_to_c(Drawing.prototype.start_draw, 'canvas_start_draw',
        'void', ['handle']);
    Module.export_to_c(Drawing.prototype.draw_update, 'canvas_draw_update',
        'void', ['handle', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.end_draw, 'canvas_end_draw',
        'void', ['handle']);

    Module.export_to_c(Drawing.prototype.clip, 'canvas_clip',
        'void', ['handle', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.unclip, 'canvas_unclip',
        'void', ['handle']);

    Module.export_to_c(Drawing.prototype.draw_text, 'canvas_draw_text',
        'void', ['handle', 'number', 'number', 'number', 'number', 'number', 'number', 'string']);
    Module.export_to_c(Drawing.prototype.draw_rect, 'canvas_draw_rect',
        'void', ['handle', 'number', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.draw_line, 'canvas_draw_line',
        'void', ['handle', 'number', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.draw_thick_line, 'canvas_draw_thick_line',
        'void', ['handle', 'number', 'number', 'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.draw_poly, 'canvas_draw_poly',
        'void', ['handle', /* int* */'number', 'number', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.draw_circle, 'canvas_draw_circle',
        'void', ['handle', 'number', 'number', 'number', 'number', 'number']);

    Module.export_to_c(Drawing.prototype.blitter_new, 'canvas_blitter_new',
        'handle', ['handle', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.blitter_free, 'canvas_blitter_free',
        'void', ['handle', 'handle']);
    Module.export_to_c(Drawing.prototype.blitter_save, 'canvas_blitter_save',
        'void', ['handle', 'handle', 'number', 'number']);
    Module.export_to_c(Drawing.prototype.blitter_load, 'canvas_blitter_load',
        'void', ['handle', 'handle', 'number', 'number']);

    // exports
    globalScope.Drawing = Drawing;

})(jQuery, window);
