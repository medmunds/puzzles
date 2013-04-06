BUILDDIR := ./build
TOOLPATH := ../emscripten/
LESSC := lessc
LESSFLAGS :=

PUZZLES_SRC = ./puzzles
PUZZLES_MAKEFILE = Makefile.emcc

LIB_JS = \
	third_party/future/future.js \
	third_party/excanvas/excanvas.js \
	third_party/jquery-requestanimationframe/jquery.requestAnimationFrame.min.js

SRC_JS = cglue.js debug.js drawing.js frontend.js
SRC_LESS = game.less

BUILT_JS = $(addprefix $(BUILDDIR)/, $(SRC_JS))
BUILT_CSS = $(addprefix $(BUILDDIR)/, $(SRC_LESS:.less=.css))


all: puzzles index css lib_js js

.PHONY: all puzzles css lib_js js index clean


puzzles: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE)
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR)

js: $(BUILT_JS)

css: $(BUILT_CSS)

index: $(BUILDDIR)/index.html


$(PUZZLES_SRC)/$(PUZZLES_MAKEFILE): $(PUZZLES_SRC)/mkfiles.pl $(PUZZLES_SRC)/Recipe
	cd $(PUZZLES_SRC) && ./mkfiles.pl

# Make a specific puzzle
puzzle-%:: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE) css lib_js js
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR) $*


lib_js: $(LIB_JS) | $(BUILDDIR)
	mkdir -p $(BUILDDIR)/lib
	cp $(LIB_JS) $(BUILDDIR)/lib/

$(BUILDDIR) :
	mkdir -p $(BUILDDIR)

$(BUILDDIR)/%.js : %.js | $(BUILDDIR)
	cp $< $@

$(BUILDDIR)/%.css : %.less | $(BUILDDIR)
	$(LESSC) $(LESSFLAGS) $< > $@

$(BUILDDIR)/%.html : puzzles-%.html | $(BUILDDIR)
	cp $< $@

clean:
	rm -f $(BUILT_CSS) $(BUILT_JS)
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) clean
