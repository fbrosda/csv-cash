FILES = public/index.php public/overview.php public/style.css

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
	rmdir $(DESTDIR)$(PREFIX)/cash/data/
	rmdir $(DESTDIR)$(PREFIX)/cash/

.PHONY: install uninstall
