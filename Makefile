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
	js/cmemmonitor.js \
	js/debug.js \
	js/drawing.js \
	js/frontend.js

SRC_LESS = less/puzzles.less

BUILT_JS = $(addprefix $(BUILDDIR)/js/, $(notdir $(SRC_JS)))
BUILT_CSS = $(addprefix $(BUILDDIR)/css/, $(notdir $(SRC_LESS:.less=.css)))

SRC_ICONS = $(wildcard $(PUZZLES_SRC)/icons/*-ibase.png)
BUILT_IMG = $(addprefix $(BUILDDIR)/img/, $(notdir $(SRC_ICONS)))

PUBLISH_TMPDIR := ./_publish_tmp


all: build_puzzles

.PHONY: all build_puzzles puzzles css lib_js js index update_puzzles_source publish clean


build_puzzles: index css lib_js js puzzles

puzzles: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE)
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR)

js: $(BUILT_JS)

css: $(BUILT_CSS)

index: $(BUILDDIR)/index.html $(BUILT_IMG)

publish: build_puzzles
	git fetch origin gh-pages
	git clone --shared --branch gh-pages --single-branch . $(PUBLISH_TMPDIR)
	cd $(PUBLISH_TMPDIR) && git merge gh-pages
	rm -rf $(PUBLISH_TMPDIR)/*
	cp -rp $(BUILDDIR)/* $(PUBLISH_TMPDIR)
	cd $(PUBLISH_TMPDIR) && \
	  git add --all . && \
	  git commit -m "Publishing `date`" && \
	  git push origin gh-pages
	rm -rf $(PUBLISH_TMPDIR)
	git push origin gh-pages


update_puzzles_source:
	git checkout sgt-puzzles
	curl -L -o puzzles.tar.gz http://www.chiark.greenend.org.uk/~sgtatham/puzzles/puzzles.tar.gz
	rm -rf puzzles
	tar -x -s '/^puzzles-r[0-9]*/puzzles/' -z -f puzzles.tar.gz
	rm puzzles.tar.gz
	git add --all puzzles
	git commit -m "Updated puzzles to r`sed -e's/-DREVISION=//' puzzles/version.def`"
	git checkout master
	git merge sgt-puzzles


$(PUZZLES_SRC)/$(PUZZLES_MAKEFILE): $(PUZZLES_SRC)/mkfiles.pl $(PUZZLES_SRC)/Recipe
	cd $(PUZZLES_SRC) && ./mkfiles.pl

# Make a specific puzzle
puzzle-%:: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE) css lib_js js
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR) $*


lib_js: $(LIB_JS) | $(BUILDDIR)
	mkdir -p $(BUILDDIR)/js/lib
	cp $(LIB_JS) $(BUILDDIR)/js/lib/

$(BUILDDIR) :
	mkdir -p $(BUILDDIR) $(BUILDDIR)/js $(BUILDDIR)/css $(BUILDDIR)/img

$(BUILDDIR)/js/%.js : js/%.js | $(BUILDDIR)/js
	cp $< $@

$(BUILDDIR)/img/%.png : $(PUZZLES_SRC)/icons/%.png | $(BUILDDIR)/img
	cp $< $@

$(BUILDDIR)/css/%.css : less/%.less | $(BUILDDIR)/css
	$(LESSC) $(LESSFLAGS) $< > $@

$(BUILDDIR)/%.html : html/%.html | $(BUILDDIR)
	cp $< $@

clean:
	rm -rf $(BUILDDIR)
	cd $(PUZZLES_SRC) && $(MAKE) -f $(PUZZLES_MAKEFILE) clean
