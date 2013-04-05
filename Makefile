BUILDDIR := ./build
TOOLPATH := ../emscripten/
LESSC := lessc
LESSFLAGS :=

PUZZLES_SRC = ./puzzles
PUZZLES_MAKEFILE = Makefile.emcc


all: puzzles css js

.PHONY: all puzzles css js clean


puzzles: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE)
	(cd $(PUZZLES_SRC); make -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR))

css: $(BUILDDIR)/game.css

$(BUILDDIR)/game.css: game.less

js:
#js: $(addprefix $(BUILDDIR)/, $(wildcard *.js))


$(PUZZLES_SRC)/$(PUZZLES_MAKEFILE): $(PUZZLES_SRC)/mkfiles.pl $(PUZZLES_SRC)/Recipe
	(cd $(PUZZLES_SRC); ./mkfiles.pl)

# Make a specific puzzle
puzzle-%:: $(PUZZLES_SRC)/$(PUZZLES_MAKEFILE) css js
	(cd $(PUZZLES_SRC); make -f $(PUZZLES_MAKEFILE) TOOLPATH=../$(TOOLPATH) BUILDDIR=../$(BUILDDIR) $*)


$(BUILDDIR):
	mkdir -p $(BUILDDIR)

$(BUILDDIR)/%.js: | %(BUILDDIR) %.js
	(cd $(BUILDDIR); ln -s ../%< .)

$(BUILDDIR)/%.css: %.less | $(BUILDDIR)
	$(LESSC) $(LESSFLAGS) $< > $@

clean:
	rm $(BUILDDIR)/*.css
	(cd $(PUZZLES_SRC); make -f $(PUZZLES_MAKEFILE) clean)
