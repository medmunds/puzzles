Porting Notes
=============

Emscripten
----------

Some lessons learned and tracking notes on using Emscripten
to build the portable puzzle collection into portable JavaScript...

Almost every setting mentioned here applies to the "link" phase
when emcc converts the LLVM bytecode to JavaScript.
(So Emscripten options go in LDFLAGS.)


### TypedArray HEAP (why 'fast.js'?)

`emcc -O2` defaults to generating runtime code that uses a JS Int32Array and
various TypedArray views for its heap. This is a significant speed boost in
browsers that support it, but a bunch of the mobile browsers seem not to.

emcc *can* generate code that uses a plain old JS Array as its HEAP, but it
considers it too complex to support both in the same generated code. So we
build two versions of each game:

* *game*.fast.js is linked with `-s USE_TYPED_ARRAYS=2`, which is the same
  as the `-O2` default.
* *game*.js is linked with `-s USE_TYPED_ARRAYS=0`, which disables TypedArrays.

Then, we select the appropriate JS file to load in the game's html, based
on browser capabilities. (I test for Float64Array, because there are
a few browsers out there that have some of the other typed arrays but
not Float64Array. Ahem: Safari 5, IE9.)

Note that even the non-TypedArray version seems usable for most of the puzzles.

(I did experiment briefly with a TypedArray polyfill, but its performance was awful.)


### Memory Size

Emscripten emulates a typical C runtime environment in JavaScript.
That means there's a *heap*. And a *stack*. In emulated *memory*
(a single JS Array or Int32Array). It's all the joys of coding in C --
the stack can even overflow and overwrite the lower end of the
static memory.

emcc's default is 16MB total memory including a 5MB stack.
This is *way more* than the puzzles need, and was killing
low-memory devices.

I'm currently linking with:
* `-s TOTAL_MEMORY=0x80000` (0.5MB, vs. 16MB default)
* `-s TOTAL_STACK=0x8000` (32KB, vs. 2MB default)
* `-s FAST_MEMORY=0x80000` -- memory to pre-initialize, so JS allocates it contiguously.
  (Default is 2MB out of the 16MB, but with only 0.5MB seems worth it just to pre-init
  the whole thing.)
* `-s ALLOW_MEMORY_GROWTH=1` -- Emscripten disables by default, saying it can be slow.
  In practice, it only kicks in in a few games, and doesn't seem to be an issue.

I also added some memory usage monitoring code. It's enabled when cmemmonitor.js is
loaded on the page (which must be before the emcc runtime loads), and displays
peak and current stack and static usage in the debug area (below the game).

I haven't observed the stack getting anywhere above ~20% of the 0x8000 allocation.
(The penalty for underallocating stack is pretty severe: a stack overflow.)

In most of the games, the static (total - stack) memory usage is similarly low,
and total memory could probably be decreased even more. (The penalty for underallocating
static memory is *possibly* a slight performance hit when sbrk is called. I haven't
noticed any performance issues.)

The one exception is Galaxies, which seems to generate very large game states
(on the undo stack). A good test for exhausting static memory is running Galaxies
and clicking a lot on the gameboard.



### Passing JavaScript objects throuch C void* pointers

I wanted to write as much of the UI code as possible in JavaScript,
rather than C. Emscripten provides some helper functions for mapping
between the two worlds.

One wrinkle: you cannot pass a JS object into an emcc-compiled C function
that wants a void* (`dhandle*`, `frontend*`, `blitter*`, etc.) and expect to get
it back again intact. Or rather, you *can*, and it will work just fine
with `USE_TYPED_ARRAYS=0`. And it will also work just fine for a while
with `USE_TYPED_ARRAYS=2`, but only while the JS object is still in a C
register variable. As soon as it gets written into the Int32Array HEAP,
the C code loses it. (Because an object is not an Int32 of course.)

I wrote some wrapper code in cglue.js to simplify this. CHandle wraps
a JS object as an integer for use by C, and unwraps it on the way back
out. The export_to_c function in that file does the wrapping/unwrapping
at the appropriate times.

#### Re-export wrinkle

IE8 has a bug that a global var declaration in one script block will
clear any value assigned to that global var in an earlier script block.

Emscripten expects to find imported functions in the global namespace.
But its generated code provokes the IE bug in a difficult-to-work-around way.
Assume the C code has an `extern frontend_function(void);` in it...

frontend.js (we provide the function implementation):

    var _frontend_function = function() {...}; // global for C import

*game*.js (emcc-generated code):

    var _frontend_function; // emcc redeclares every C extern
    // IE8 bug means _frontend_function is now undefined

    // emcc then builds a runtime function table, containing the undefined function.
    // Later uses of the function are through this table.
    var FUNCTION_TABLE = [ ... _frontend_function, ... ];

The fix requires assigning a value to _frontend_function *in* game.js, before
emcc builds its function table. I'm accomplishing this by linking with a
`--pre-js` option, which emcc copies into the game.js source. That pre-js
code calls the cglue function `reexport_all_to_c`, which hacks the global
vars back into place.



### ASM_JS

Building with `-s ASM_JS=1` resulted in a broken memcpy when I tried it.
Discussed here: https://groups.google.com/d/msg/emscripten-discuss/520j4Lop2lg/uaeTo97Ss2YJ.
Waiting for the fix to land in Emscripten to try again.


### Debugging

Helpful LDFLAGS for making the emcc-generated code more debuggable:

* `--closure 0` -- leave the variable names readable
* `-s INLINING_LIMIT=50` -- don't inline anything
* `-s CORRUPTION_CHECK=1` -- for tracking heap issues
* `-s SAFE_HEAP=3 -s SAFE_HEAP_LINES=\"['random.c:139', 'random.c:140', 'random.c:141', 'random.c:142', 'random.c:143', 'random.c:144']\"`
  -- for tracking every heap access; the SAFE_HEAP_LINES is needed because some casts in
  random.c seem to confuse Emscripten's validation code.


### Good Test Cases


* large heap usage: galaxies

* complicated (lengthy) puzzle generation: pearl (default), filling (13x17)

* easy puzzle generation & smallest code: pegs

* animation: untangle "solve"



Other Porting Notes
-------------------

Non-Emscripten stuff...

### requestAnimationFrame

Using `requestAnimationFrame` should in theory help with battery life
on mobile devices. It requires a polyfill for some of the older devices.
(The puzzles are pretty good about only enabling timer events when
they actually need them, so in practice this may not make much difference.)


### jQuery

I was managing without it, but finally broke down when it came to
rationalizing keyboard events across the various browsers.
(And now that it's in there, it's become pervasive.)

I *am* loading the new, "light" 2.0 beta in everything but IE.


### Touch events

Handling touch dramatically improves game responsiveness on tablets.
I'm currently directly mapping touchstart/move/end to the equivalent
mouse events, but only in the gameboard canvas.

Improvements needed:
* Also catch touch on buttons (new, undo, etc. -- watch out for "double tap" on undo)
* Somehow distinguish touch gestures like pinch-zoom or page-scroll from
  game events (maybe start with don't consume multitouch events)
