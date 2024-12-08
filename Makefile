FILES = public/index.php public/overview.php public/style.css public/favicon.png public/favicon.svg \
public/main.js public/service-worker.js public/manifest.json

ifeq ($(PREFIX),)
	PREFIX := /srv/http/
endif

install:
	install -d $(DESTDIR)$(PREFIX)/cash/
	install -d $(DESTDIR)$(PREFIX)/cash/data/
	install -m 644 $(FILES) $(DESTDIR)$(PREFIX)/cash/

uninstall:
	for f in $(DESTDIR)$(PREFIX)/cash/*.php; do rm $${f}; done
	for f in $(DESTDIR)$(PREFIX)/cash/*.css; do rm $${f}; done
	for f in $(DESTDIR)$(PREFIX)/cash/*.js; do rm $${f}; done
	for f in $(DESTDIR)$(PREFIX)/cash/*.json; do rm $${f}; done
	for f in $(DESTDIR)$(PREFIX)/cash/favicon.*; do rm $${f}; done
	rmdir $(DESTDIR)$(PREFIX)/cash/data/
	rmdir $(DESTDIR)$(PREFIX)/cash/

.PHONY: install uninstall
