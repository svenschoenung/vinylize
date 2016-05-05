# API

## vinylize([optionsMap])

Returns a [`stream.Transform`] that converts objects to [`vinyl`] files. 

Each source object is stored in the `.data` property of the generated `vinyl` file. This follows the standard proposed by [`gulp-data`] and allows for interoperability with other gulp plugins.


[`stream.Transform`]: https://nodejs.org/api/stream.html#stream_class_stream_transform
[`vinyl`]: https://npmjs.com/package/vinyl
[`gulp-data`]: https://npmjs.com/package/gulp-data


### Vinyl file construction

Almost all [constructor options] that are normally available when creating `vinyl` files are also available when using `vinylize()`. 

The following table lists all constructor options that are supported by `vinyl` and how they are treated by `vinylize()`:

| Option     | Type                   | Default                    | Description 
| ---------- | ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `cwd`      | `String`               | [`process.cwd()`]          | The absolute path of the current working directory.
| `base`     | `String`               | [`path.dirname`] of `path` | The absolute or relative base path of the new file. Relative paths are [resolved] from `cwd`.
| `path`     | `String`               |                            | The absolute or relative path for the new file. Relative paths are [resolved] from `cwd`. This **has** to be provided either as a source object property or in the options map.
| `history`  |                        |                            | This is ignored.
| `stat`     | [`fs.Stats`]           | `null`                     | File permissions, timestamps etc. that the new file should have.
| `contents` | [`Buffer`], [`Stream`] | empty `Buffer`             | File contents.

The constructor options can be supplied in two different ways: as [**properties of each source object**](#source-object-properties) or as part of an [**options map**](#options-map) passed directly to `vinylize()`.

[constructor options]: https://www.npmjs.com/package/vinyl#constructoroptions
[resolved]: https://nodejs.org/api/path.html#path_path_resolve_from_to
[`process.cwd()`]: https://nodejs.org/api/path.html#path_path_dirname_path
[`path.dirname`]: https://nodejs.org/api/path.html#path_path_dirname_path
[`fs.Stats`]: https://nodejs.org/api/fs.html#fs_class_fs_stats
[`Buffer`]: https://nodejs.org/api/buffer.html
[`Stream`]: https://nodejs.org/api/stream.html


#### Source object properties

All properties of the source object are passed to the `vinyl` file constructor unless they are overwritten in the options map passed to `vinylize()` itself.

*See example: [Using source object properties]*

#### Options map

Each option can be provided as a **function**, a **string** or **other value**:

* **Functions** receive the current source object and must return a value appropriate for the option. The returned value is used as is. The function returning the option value must be synchronous. This might change in the future to support asynchronous operations.

  *See example: [Using functions in options map]*

* **Strings** are treated as [lodash templates]. The current source object is available in the template as the `data` variable. The options map itself is available as the `options` variable. If you want to provide a plain string value that should not be interpreted as a lodash template, return the value from a **function**.

  *See example: [Using lodash templates in options map]*

* **Other option values** are used as is, so for every source object the same option value will be applied when creating the `vinyl` file. Note: using a mutable object like `Buffer` means that if one of the resulting `vinyl` files is altered, all files might be altered. Return a different `Buffer` for each source object from a **function** to prevent this. 

  *See example: [Using values in options map]*


[lodash templates]: https://lodash.com/docs#template
[Using source object properties]: examples/using-source-object-properties.md
[Using functions in options map]: examples/using-functions-in-options-map.md
[Using lodash templates in options map]: examples/using-lodash-templates-in-options-map.md
[Using values in options map]: examples/using-values-in-options-map.md
