function Drawing() {
    "use strict";

    var obj = { 'type': "Drawing" };
    var qx = 0.5, qy = 0.5; // adjust lines onto pixels
    var defaultLineWidth = 1;

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        palette = [];

    function set_palette_entry(index, r, g, b) {
        function hex(i) {
            return ("0" + i.toString(16)).slice(-2);
        }
        palette[index] = '#' + hex(r) + hex(g) + hex(b);
    }

    function resize(w, h) {
        canvas.width = w + 2*qx;
        canvas.height = h + 2*qy;
    }

    function clip(x, y, w, h) {
        context.save();
        context.beginPath();
        context.rect(x, y, w+2*qx, h+2*qy);
        context.clip();
    }

    function unclip() {
        context.restore();
    }

    function fillAndStrokeIt(fillclr, strokeclr, linewidth) {
        if (linewidth === undefined) {
            linewidth = defaultLineWidth;
        }
        context.strokeStyle = palette[strokeclr];
        context.lineWidth = linewidth;
        if (fillclr >= 0) {
            context.fillStyle = palette[fillclr];
            context.fill();
        }
        context.stroke();
    }

    function draw_text(x, y, proportional, fontsize, valign, halign, clr, text) {
        var fontfamily = proportional ? "Arial" : "fixed";
        context.font = "bold " + fontsize + "px " + fontfamily;
        context.textBaseline = valign;
        context.textAlign = halign;
        context.fillStyle = palette[clr];
        context.fillText(text, x+qx, y+qy);
    }

    function draw_rect(x, y, w, h, strokeclr) {
        context.fillStyle = palette[strokeclr];
        context.fillRect(x+qx, y+qy, w, h);
    }

    function draw_line(x1, y1, x2, y2, strokeclr, linewidth) {
        context.beginPath();
        context.moveTo(x1+qx, y1+qy);
        context.lineTo(x2+qx, y2+qy);
        fillAndStrokeIt(-1, strokeclr, linewidth);
    }

    function draw_poly(points, fillclr, strokeclr) {
        context.beginPath();
        var point = points.pop();
        context.moveTo(point.x+qx, point.y+qy);
        while (point = points.pop()) {
            context.lineTo(point.x+qx, point.y+qy);
        }
        fillAndStrokeIt(fillclr, strokeclr);
    }

    function draw_circle(cx, cy, radius, fillclr, strokeclr) {
        context.beginPath();
        context.arc(cx+qx, cy+qy, radius, 0, Math.PI * 2, false);
        context.closePath();
        fillAndStrokeIt(fillclr, strokeclr);
    }

    // Blitter
    var blitters = {},
        lastBlitterId = 0;

    function blitter_new(w, h) {
        var id = ++lastBlitterId;
        blitters[id] = {w: w, h: h, id: id};
        return id; // must be a number, so it can be stored in C void* handle (Int32)
    }

    function blitter_free(id) {
        delete blitters[id];
    }

    function blitter_save(id, x, y) {
        var blitter = blitters[id];
        if (blitter) {
            blitter.x = x;
            blitter.y = y;
            blitter.data = context.getImageData(x, y, blitter.w, blitter.h);
        }
    }

    function blitter_load(id, x, y) {
        var blitter = blitters[id];
        if (blitter && blitter.data) {
            if (x === undefined) {
                x = blitter.x;
            }
            if (y === undefined) {
                y = blitter.y;
            }
            context.putImageData(blitter.data, x, y);
        }
    }


    // Public methods
    obj.set_palette_entry = set_palette_entry;
    obj.resize = resize;
    obj.clip = clip;
    obj.unclip = unclip;
    obj.draw_text = draw_text;
    obj.draw_rect = draw_rect;
    obj.draw_line = draw_line;
    obj.draw_poly = draw_poly;
    obj.draw_circle = draw_circle;
    obj.blitter_new = blitter_new;
    obj.blitter_free = blitter_free;
    obj.blitter_save = blitter_save;
    obj.blitter_load = blitter_load;

    return obj;
}
