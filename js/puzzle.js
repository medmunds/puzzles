/* puzzle.js
 * Game state logic and JS-side frontend code
 */
var Puzzle = (function($) {
    "use strict";

    var puzzle, // the Puzzle singleton
        midend, // an opaque C handle
        drawing;

    var options = {}; // game options

    var $app, $canvas, $status;
    var canvas;

    function Puzzle(app_id, canvas_id, status_id) {
        $app = $('#'+app_id);
        $canvas = $('#'+canvas_id);
        $status = $('#'+status_id);

        canvas = $canvas.get(0);

        initCImports();

        drawing = new Drawing($canvas, $status);
        init_game(CHandle(puzzle), CHandle(drawing)); // calls back to frontend_set_game_info

        Events.initEvents(puzzle, $app, $canvas);
        buildPresetsMenu();

        // Minimize load-time flashing: app has been hidden until now.
        // Resize the canvas to its full target, then display the app.
        // (It may shrink again as the first new game is created.)
        resize();
        $app.css('visibility', 'visible');
        $(".help").css('visibility', 'visible');

        return puzzle;
    }

    puzzle = {
        newGame: newGame,
        restartGame: restartGame,
        solve: solve,
        undo: undo,
        redo: redo,
        resize: resize,
        handleInput: handleInput
    };

    //
    // Controls
    //

    var showedSolution = false;

    function newGame() {
        showedSolution = false;
        dismissCurrentMessage();
        var msg = showMessage('#loading', false, true);
        msg.shown(function() {
            midend_new_game(midend);
            newGameCalled = true;
            if (pendingResize) {
                resize();
            }
            midend_redraw(midend);
            updateControlState();
            msg.hide();
            $(".game").css('visibility', 'visible');
        });
        msg.show();
    }

    function restartGame() {
        midend_restart_game(midend);
        updateControlState();
    }

    function solve() {
        showedSolution = true;
        midend_solve(midend);
        updateControlState();
    }

    function undo() {
        midend_process_key(midend, -1, -1, 'u'.charCodeAt(0));
        updateControlState();
    }

    function redo() {
        midend_process_key(midend, -1, -1, 'r'.charCodeAt(0));
        updateControlState();
    }

    function handleInput(x, y, button, dontUpdateControls) {
        midend_process_key(midend, x, y, button);
        if (!dontUpdateControls) {
            updateControlState();
        }
    }


    function updateControlState() {
        var canUndo = !!midend_can_undo(midend),
            canRedo = !!midend_can_redo(midend),
            status = midend_status(midend);

        $('.command.game-solve').prop('disabled', (status !== 0));
        $('.command.undo').prop('disabled', !canUndo);
        $('.command.redo').prop('disabled', !canRedo);

        if (status > 0) {
            if (!showedSolution) {
                showMessage('#win', true);
            }
        } else if (status < 0) {
            showMessage('#loss', true);
        } else {
            dismissCurrentMessage();
        }
    }


    //
    // Messages
    //

    var currentMessage;

    function showMessage(selector, closeOnBackdrop, waitToShow) {
        dismissCurrentMessage();
        currentMessage = new Message(selector, closeOnBackdrop);
        if (!waitToShow) {
            currentMessage.show();
        }
        return currentMessage;
    }

    function dismissCurrentMessage() {
        if (currentMessage) {
            currentMessage.hide();
            currentMessage = null;
        }
    }


    //
    // Bootstraping
    //

    function frontend_set_game_info(
        _midend, name, can_configure, can_solve, can_format_as_text_ever,
        wants_statusbar, is_timed, require_rbutton, require_numpad)
    {
        midend = _midend;
        options.name = name;
        options.configurable = can_configure;
        options.solveable = can_solve;
        options.saveable = can_format_as_text_ever;
        options.hasStatusBar = wants_statusbar;
        options.isTimed = is_timed;
        options.usesRightButton = require_rbutton;
        options.usesNumpad = require_numpad;

        $status.toggle(options.hasStatusBar);

        $('h1').text(options.name);
        $('head title').text(options.name);
        $('.keyboard').toggle(options.usesNumpad);
        $('.command.game-solve').toggle(options.solveable);
    }
    Module.export_to_c(frontend_set_game_info, 'frontend_set_game_info', 'void',
        ['ignore', 'void*', 'string', 'bool', 'bool', 'bool',
            'bool', 'bool', 'bool', 'bool']);


    function parseRGB(str) {
        // Based on http://stackoverflow.com/a/11068286/647002
        var m = str.match(/^#([0-9a-f]{3})$/i);
        if (m) {
            // in three-character format, each value is multiplied by 0x11 to give an
            // even scale from 0x00 to 0xff
            return [
                parseInt(m[1].charAt(0),16)*0x11,
                parseInt(m[1].charAt(1),16)*0x11,
                parseInt(m[1].charAt(2),16)*0x11
            ];
        }
        m = str.match(/^#([0-9a-f]{6})$/i);
        if (m) {
            return [
                parseInt(m[1].substr(0,2),16),
                parseInt(m[1].substr(2,2),16),
                parseInt(m[1].substr(4,2),16)
            ];
        }
        m = str.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (m) {
            return [m[1],m[2],m[3]];
        }
        // we don't do named colors
        return undefined;
    }

    function frontend_default_colour(/* float* */colourptr) {
        var bgcolor = $canvas.css('background-color'),
            rgb = parseRGB(bgcolor),
            rgbFloat = [0.8, 0.8, 0.8];
        if (rgb) {
            rgbFloat = rgb.map(function(clr) {
                return clr / 255.0;
            });
        }
        // Write it back to C
        var type = 'float',
            size = Runtime.getNativeTypeSize(type);
        setValue(colourptr, rgbFloat[0], type); colourptr += size;
        setValue(colourptr, rgbFloat[1], type); colourptr += size;
        setValue(colourptr, rgbFloat[2], type);
    }
    Module.export_to_c(frontend_default_colour, 'frontend_default_colour', 'void',
        ['ignore', 'float*']);



    //
    // Sizing
    //

    var inResize = false,
        newGameCalled = false,  // interlock for midend_set_size
        pendingResize = false;

    function resize() {
        if (inResize) {
            debug("Avoiding reentrant frontend.resize");
            return;
        }
        inResize = true;
        pendingResize = false;

        var target = calcMaxCanvasSize();

        //console.log("Target size: " + target.width + "x" + target.height);

        if (!newGameCalled) {
            // Can only midend_size after midend_new_game
            // But size now to our target, to minimize flashing
            pendingResize = true; // after new game
            drawing.resize(target.width, target.height);
        } else {
            var type = 'i32',
                wptr = allocate([target.width], type, ALLOC_STACK),
                hptr = allocate([target.height], type, ALLOC_STACK);
            midend_size(midend, wptr, hptr, /*usersize=*/true);

            var w = getValue(wptr, type),
                h = getValue(hptr, type);
            //console.log("Negotized size: " + size.w + "x" + size.h);

            drawing.resize(w, h);
            // don't force_redraw here -- not necessary, and can cause big memory mess
            midend_redraw(midend);
        }

        inResize = false;
    }

    function calcMaxCanvasSize() {
        var $game = $canvas.parent(),
            $keyboard = $(".keyboard");

        var gameBorder = $game.outerWidth(true) - $game.width(),
            availableWidth = $app.width() - gameBorder;

        //availableWidth -= 32; // in case we pick up a vertical scrollbar
        var minWidth = parseInt($canvas.css('min-width'));
        if (minWidth) {
            availableWidth = Math.max(minWidth, availableWidth);
        }

        var windowHeight = $(window).height(),
            appBottom = $app.offset().top + $app.outerHeight(true), // in page coords, including margin
            availableHeight = windowHeight - appBottom; // reserve space for the whole app (and above)

        availableHeight += $canvas.height(); // what canvas is currently using is available
        if (!options.hasStatusBar && $status.is(":visible")) { // e.g., during initial load
            availableHeight += $status.outerHeight();
        }
        if (!options.usesNumpad && $keyboard.is(":visible")) {
            availableHeight += $keyboard.outerHeight(); // e.g., during initial load
        }
        var minHeight = parseInt($canvas.css('min-height'));
        if (minHeight) {
            availableHeight = Math.max(minHeight, availableHeight);
        }

        return { width: availableWidth, height: availableHeight };
    }


    //
    // Presets and Configs
    //

    var presets = [];

    function frontend_add_preset(name, paramsptr) {
        presets.push({
            name: name,
            value: paramsptr
        });
    }
    Module.export_to_c(frontend_add_preset, 'frontend_add_preset', 'void',
        ['ignore', 'string', 'void*']);

    function buildPresetsMenu() {
        if (!presets) {
            return;
        }
        var $menu = $('#game_preset_menu');
        $menu.empty();
        presets.forEach(function(preset) {
            $('<option>')
                .text(preset.name)
                .attr('value', preset.value)
                .appendTo($menu);
        });

        var current = midend_which_preset(midend);
        if (current >= 0) {
            $menu.val(presets[current].value);
        } // else custom config

        $menu.on('change', function() {
            var val = $menu.val();
            // Let the browser finish closing the menu before
            // taking the time to generate the new game
            // (helps on iPad)
            setTimeout(function() {
                choosePreset(Number(val));
            }, 100);
        });
    }

    function choosePreset(paramsptr) {
        midend_set_params(midend, paramsptr);
        pendingResize = true;
        newGame();
    }


    //
    // Timer and animation
    //

    var animationId,
        lastAnimationTime;

    function activate_timer() {
        if (!animationId) {
            lastAnimationTime = Date.now();
            animationId = requestAnimationFrame(doAnimation);
        }
    }
    Module.export_to_c(activate_timer, 'activate_timer', 'void', ['ignore']);

    function deactivate_timer() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    Module.export_to_c(deactivate_timer, 'deactivate_timer', 'void', ['ignore']);

    function doAnimation(/*timestamp*/) {
        var now = Date.now(),
            seconds = (now - lastAnimationTime) / 1000;
        lastAnimationTime = now;
        animationId = requestAnimationFrame(doAnimation);
        midend_timer(midend, seconds);
    }


    //
    // Imports from C
    // These must also be listed in c_exports.json.
    // Note that Module.cwrap can't be called until the game script is
    // loaded, so we init these inside the Puzzle constructor.
    //
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

    return Puzzle;
})(jQuery);
