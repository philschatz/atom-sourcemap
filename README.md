# Atom Sourcemap Plugin

![atom-sourcemap](https://user-images.githubusercontent.com/253202/33521538-4aa21ffe-d7a2-11e7-81a0-0e6928ffe250.gif)


# What is this?

This lets you open any generated file that contains a source map (JS, CSS, or HTML, or others) and view the source files they were built from (if they contain a `sourceMappingURL` comment)

# What types of files does it work on?

It works on _any_ file that has the string ` sourceMappingURL=` in it. This includes `.css`, `.js`, `.html` files.

# TODO

- [ ] support the `data-uri:` method of encoding the sourcemaps into the file.
- [ ] support the `sourceContents: ` field in the sourcemap when the original file cannot be found
