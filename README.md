# What is this?

This lets you open JS, CSS, or HTML files and view the source files they were built from (if they contain a `sourceMappingURL` comment)

# What types of files does it work on?

It works on any file that has the string ` sourceMappingURL=` in it. This includes `.css`, `.js`, `.html` files.

# TODO

- [ ] support the `data-uri:` method of encoding the sourcemaps into the file.
- [ ] support the `sourceContents: ` field in the sourcemap when the original file cannot be found
