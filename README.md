HTML5 Puzzles
=============

### ▶ [Play the puzzles][play] in your browser

-----

This is an *unmaintained, unfinished* (but working) HTML5/JavaScript port
of [Simon Tatham's Portable Puzzle Collection][sgt-puzzles]
from 2013. All puzzles are [playable][play];
some limitations are in the to-do list below.

\[Note that the source [puzzle collection][sgt-puzzles] has its
own JavaScript build, which was originally released around the
same time as this port. Since it's maintained, it's probably a 
better starting point if you want to experiment.]

I prioritized making the puzzles work as well as possible
on tablets, phones, and other devices with small and/or touch
screens. A virtual keyboard is included for (most) puzzles
that need it.

The portable puzzle source code (in the puzzles directory)
is written in C. Cross-compilation to JS uses [Emscripten][emscripten].
See the [porting notes][porting] for more details.

The ports have been observed working successfully on:
* Chrome
* Firefox
* Internet Explorer 9 (and later, presumably)
* Internet Explorer 8 (albeit slowly)
* iPad (tested on iPad 1 with iOS 5 and Mobile Safari 5)
* Android 2.3


[emscripten]: https://github.com/kripken/emscripten
[play]: http://medmunds.github.io/puzzles/
[porting]: porting-notes.md
[sgt-puzzles]: http://www.chiark.greenend.org.uk/~sgtatham/puzzles/


To Do
-----

* Custom puzzle settings ("configs")

* Auto-save/restore puzzle state (cookie or localStorage)

* Save to/load from other puzzle ports (the file format is portable)

* Link to specific game ids

* "Right-mouse" support for touch devices for certain puzzles that require it
  (e.g, Magnets). Maybe use long-press like the Android port does?
  And/or a "right mouse lock" virtual key?

* Drag and drop from virtual keyboard into puzzles.
  Would dramatically improve usability on the Latin-square puzzles.
  (Requires support in puzzles code -- maybe add as #ifdef STYLUS option?)

* Virtual keyboards: Undead needs custom keys (g, v, z). Solo needs hex digits
  in some variations. All of the number games would benefit from hiding unusable
  keys based on current config (like the Android port does).

* Combine and closure-compile the non-Emscripten JS

* Experiment with moving C code into a WebWorker, to avoid locking up
  the browser during puzzle generation.


Building
--------

This port requires Emscripten 1.29.6. **Newer Emscripten versions won't work**
because this code hasn't been updated to track emcc command-line and runtime changes.

You should be able to build all the puzzles with `make TOOLPATH=/path/to/emscripten/1.29.6/bin/`.
Other build targets are in the top-level [Makefile](Makefile); their names should be 
self-explanatory. 

See the [porting notes][porting] for additional discussion of this code.
