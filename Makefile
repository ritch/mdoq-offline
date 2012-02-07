test:
	@node test/support/server.js

# mdoq.offline.min.js: mdoq.offline.js
#  	uglifyjs --no-mangle $< > $@

.PHONY: test
