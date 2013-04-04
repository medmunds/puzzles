BUILDDIR := ./build
TOOLPATH := ../emscripten
LESSC := lessc
LESSFLAGS :=


all: puzzles css js

.PHONY: all puzzles css js


puzzles:
	(cd puzzles; make -f Makefile.emcc TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR))

css: $(BUILDDIR)/game.css

$(BUILDDIR)/game.css: game.less

js:
#js: $(addprefix $(BUILDDIR)/, $(wildcard *.js))


$(BUILDDIR):
	mkdir -p $(BUILDDIR)

$(BUILDDIR)/%.js: | %(BUILDDIR) %.js
	(cd $(BUILDDIR); ln -s ../%< .)

$(BUILDDIR)/%.css: %.less | $(BUILDDIR)
	$(LESSC) $(LESSFLAGS) $< > $@
