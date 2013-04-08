BUILDDIR := ./build
TOOLPATH := ../emscripten/
LESSC := lessc
LESSFLAGS := --include-path=third_party/bootstrap/less

PUZZLES_SRC = ./puzzles
PUZZLES_MAKEFILE = Makefile.emcc

LIB_JS = \
	third_party/future/future.js \
	third_party/excanvas/excanvas.js \
	third_party/jquery-requestanimationframe/jquery.requestAnimationFrame.min.js

SRC_JS = \
	js/cglue.js \
	js/debug.js \
	js/drawing.js \
	js/frontend.js

SRC_LESS = less/puzzles.less

BUILT_JS = $(addprefix $(BUILDDIR)/js/, $(notdir $(SRC_JS)))
BUILT_CSS = $(addprefix $(BUILDDIR)/css/, $(notdir $(SRC_LESS:.less=.css)))


all: index css lib_js js puzzles

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
	mkdir -p $(BUILDDIR)/js/lib
	cp $(LIB_JS) $(BUILDDIR)/js/lib/

$(BUILDDIR) :
	mkdir -p $(BUILDDIR) $(BUILDDIR)/js $(BUILDDIR)/css

$(BUILDDIR)/js/%.js : js/%.js | $(BUILDDIR)/js
	cp $< $@

$(BUILDDIR)/css/%.css : less/%.less | $(BUILDDIR)/css
	$(LESSC) $(LESSFLAGS) $< > $@

$(BUILDDIR)/%.html : html/%.html | $(BUILDDIR)
	cp $< $@

clean:
	rm -f $(BUILT_CSS) $(BUILT_JS)
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) clean
