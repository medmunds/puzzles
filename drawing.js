function Drawing() {
    "use strict";

    var obj = { 'type': "Drawing" };
    var qx = 0.5, qy = 0.5; // adjust lines onto pixels

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        palette = [];

    function set_palette_entry(index, r, g, b) {
        palette[index] = '#' + r.toString(16) + g.toString(16) + b.toString(16);
    }

    function resize(w, h) {
        canvas.width = w + 2*qx;
        canvas.height = h + 2*qy;
    }

    function clip(x, y, w, h) {
        context.save();
        context.beginPath();
        context.rect(x+qx, y+qy, w, h);
        context.clip();
    }

    function unclip() {
        context.restore();
    }

    function fillAndStrokeIt(fillclr, strokeclr) {
        if (fillclr >= 0) {
            context.fillStyle = palette[fillclr];
            context.fill();
        }
        context.strokeStyle = palette[strokeclr];
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

    function draw_rect(x, y, w, h, clr) {
        context.strokeStyle = palette[clr];
        context.strokeRect(x+qx, y+qy, w, h);
    }

    function draw_line(x1, y1, x2, y2, width, clr) {
        context.beginPath();
        context.moveTo(x1+qx, y1+qy);
        context.lineTo(x2+qx, y2+qy);
        context.strokeStyle = palette[clr];
        context.lineWidth = width;
        context.stroke();
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

    obj.set_palette_entry = set_palette_entry;
    obj.resize = resize;
    obj.clip = clip;
    obj.unclip = unclip;
    obj.draw_text = draw_text;
    obj.draw_rect = draw_rect;
    obj.draw_line = draw_line;
    obj.draw_poly = draw_poly;
    obj.draw_circle = draw_circle;

    return obj;
}
