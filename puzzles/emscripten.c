/*
 * emscripten.c: JavaScript/Canvas front end for Simon Tatham's puzzle collection.
 * Based on nestedvm.c
 */

#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <time.h>
#include <stdarg.h>
#include <string.h>
#include <errno.h>

#include <sys/time.h>

#include <emscripten/emscripten.h> /* for emscripten_set_main_loop */

#include "puzzles.h"


extern void frontend_set_midend(frontend *fe, midend *me);
extern midend *frontend_get_midend(frontend *fe);
extern void *frontend_get_drawing(frontend *fe);

/*
 * Mid-end to front-end calls
 * http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/midend.html#frontend-api
 */

void get_random_seed(void **randseed, int *randseedsize)
{
    // TODO: move to JS?
    struct timeval *tvp = snew(struct timeval);
    gettimeofday(tvp, NULL);
    *randseed = (void *)tvp;
    *randseedsize = sizeof(struct timeval);
}

extern void activate_timer(frontend *fe);
extern void deactivate_timer(frontend *fe);

void fatal(char *fmt, ...)
{
    va_list ap;
    fprintf(stderr, "fatal error: ");
    va_start(ap, fmt);
    vfprintf(stderr, fmt, ap);
    va_end(ap);
    fprintf(stderr, "\n");
    exit(1);
}

void frontend_default_colour(frontend *fe, float *output)
{
    // TODO: pull this from css via js
    output[0] = output[1]= output[2] = 0.8f;
}


/*
 * Front-end Drawing API
 * http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/drawing.html#drawing-frontend
 */

extern void canvas_set_palette_entry(void *handle, int index, int r, int g, int b);
extern void canvas_resize(void *handle, int w, int h);

extern void canvas_status_bar(void *handle, char *text);
extern void canvas_start_draw(void *handle);
extern void canvas_clip(void *handle, int x, int y, int w, int h);
extern void canvas_unclip(void *handle);
extern void canvas_draw_text(void *handle, int x, int y, int fonttype, int fontsize,
		   int align, int colour, char *text);
extern void canvas_draw_rect(void *handle, int x, int y, int w, int h, int colour);
extern void canvas_draw_line(void *handle, int x1, int y1, int x2, int y2, int colour);
extern void canvas_draw_thick_line(void *handle, float thickness,
                     float x1, float y1, float x2, float y2, int colour);
extern void canvas_draw_poly(void *handle, int *coords, int npoints,
			int fillcolour, int outlinecolour);
extern void canvas_draw_circle(void *handle, int cx, int cy, int radius,
		     int fillcolour, int outlinecolour);
extern void canvas_draw_update(void *handle, int x, int y, int w, int h);

extern blitter *canvas_blitter_new(void *handle, int w, int h);
extern void canvas_blitter_free(void *handle, blitter *bl);
extern void canvas_blitter_save(void *handle, blitter *bl, int x, int y);
extern void canvas_blitter_load(void *handle, blitter *bl, int x, int y);
extern void canvas_end_draw(void *handle);


char *canvas_text_fallback(void *handle, const char *const *strings,
			     int nstrings)
{
    /*
     * We assume JavaScript can cope with any UTF-8 likely to be emitted
     * by a puzzle.
     */
    return dupstr(strings[0]);
}

const struct drawing_api canvas_drawing = {
    canvas_draw_text,
    canvas_draw_rect,
    canvas_draw_line,
    canvas_draw_poly,
    canvas_draw_circle,
    canvas_draw_update,
    canvas_clip,
    canvas_unclip,
    canvas_start_draw,
    canvas_end_draw,
    canvas_status_bar,
    canvas_blitter_new,
    canvas_blitter_free,
    canvas_blitter_save,
    canvas_blitter_load,
    NULL, NULL, NULL, NULL, NULL, NULL, /* {begin,end}_{doc,page,puzzle} */
    NULL, NULL,			       /* line_width, line_dotted */
    canvas_text_fallback,
    canvas_draw_thick_line,
};


/*
 * Configuration
 * http://www.chiark.greenend.org.uk/~sgtatham/puzzles/devel/midend.html#midend
 */

#ifdef NOTYET

void jcallback_config_ok()
{
    frontend *fe = (frontend *)_fe;
    char *err;

    err = midend_set_config(fe->me, fe->cfg_which, fe->cfg);

    if (err)
	_call_java(2, (int) "Error", (int)err, 1);
    else {
	fe->cfgret = TRUE;
    }
}

void jcallback_config_set_string(int item_ptr, int char_ptr) {
    config_item *i = (config_item *)item_ptr;
    char* newval = (char*) char_ptr;
    sfree(i->sval);
    i->sval = dupstr(newval);
    free(newval);
}

void jcallback_config_set_boolean(int item_ptr, int selected) {
    config_item *i = (config_item *)item_ptr;
    i->ival = selected != 0 ? TRUE : FALSE;
}

void jcallback_config_set_choice(int item_ptr, int selected) {
    config_item *i = (config_item *)item_ptr;
    i->ival = selected;
}

static int get_config(frontend *fe, int which)
{
    char *title;
    config_item *i;
    fe->cfg = midend_get_config(fe->me, which, &title);
    fe->cfg_which = which;
    fe->cfgret = FALSE;
    _call_java(10, (int)title, 0, 0);
    for (i = fe->cfg; i->type != C_END; i++) {
	_call_java(5, (int)i, i->type, (int)i->name);
	_call_java(11, (int)i->sval, i->ival, 0);
    }
    _call_java(12,0,0,0);
    free_cfg(fe->cfg);
    return fe->cfgret;
}

#endif /* NOTYET */

static void resize_fe(frontend *fe)
{
    // TODO: move this entire thing to JS
    int w, h;
    midend *me = frontend_get_midend(fe);
    void *dhandle = frontend_get_drawing(fe);

    w = INT_MAX;
    h = INT_MAX;
    midend_size(me, &w, &h, FALSE);
    canvas_resize(dhandle, w, h);
    midend_force_redraw(me);
}

#ifdef NOTYET

int jcallback_preset_event(int ptr_game_params)
{
    frontend *fe = (frontend *)_fe;
    game_params *params =
	(game_params *)ptr_game_params;

    midend_set_params(fe->me, params);
    midend_new_game(fe->me);
    resize_fe(fe);
    _call_java(13, midend_which_preset(fe->me), 0, 0);
    return 0;
}

int jcallback_config_event(int which)
{
    frontend *fe = (frontend *)_fe;
    _call_java(13, midend_which_preset(fe->me), 0, 0);
    if (!get_config(fe, which))
	return 0;
    midend_new_game(fe->me);
    resize_fe(fe);
    _call_java(13, midend_which_preset(fe->me), 0, 0);
    return 0;
}

int jcallback_about_event()
{
    char titlebuf[256];
    char textbuf[1024];

    sprintf(titlebuf, "About %.200s", thegame.name);
    sprintf(textbuf,
	    "%.200s\n\n"
	    "from Simon Tatham's Portable Puzzle Collection\n\n"
	    "%.500s", thegame.name, ver);
    _call_java(2, (int)&titlebuf, (int)&textbuf, 0);
    return 0;
}

#endif /* NOTYET */


/*
 * Main
 */

extern void js_add_preset(char *name, game_params *params);
extern void js_mark_current_preset(int index);
extern void frontend_set_game_options(frontend *fe,
    const char *name, int can_configure, int can_solve, int can_format_as_text_ever,
    int wants_statusbar, int is_timed, int require_rbutton, int require_numpad);

int init_game(frontend *fe, char *game_id)
{
    int i, n;
    float* colours;
    void* dhandle;
    midend* me;

    dhandle = frontend_get_drawing(fe);

    frontend_set_game_options(
        fe,
        thegame.name,
        thegame.can_configure,
	    thegame.can_solve,
	    thegame.can_format_as_text_ever,
	    thegame.wants_statusbar,
	    thegame.is_timed,
	    (thegame.flags & REQUIRE_RBUTTON) == REQUIRE_RBUTTON,
	    (thegame.flags & REQUIRE_NUMPAD) == REQUIRE_NUMPAD
	);

    me = midend_new(fe, &thegame, &canvas_drawing, dhandle);
    frontend_set_midend(fe, me);

    if (game_id)
	    midend_game_id(me, game_id);   /* ignore failure */
    midend_new_game(me);

    /*
    if ((n = midend_num_presets(me)) > 0) {
        for (i = 0; i < n; i++) {
            char *name;
            game_params *params;
            midend_fetch_preset(me, i, &name, &params);
	        js_add_preset(name, params);
        }
    }
    js_mark_current_preset(midend_which_preset(me));
    */

    colours = midend_colours(me, &n);
    for (i = 0; i < n; i++) {
	    canvas_set_palette_entry(dhandle, i,
		   (int)(colours[i*3] * 0xFF),
		   (int)(colours[i*3+1] * 0xFF),
		   (int)(colours[i*3+2] * 0xFF));
    }

    resize_fe(fe);


    return 0;
}
