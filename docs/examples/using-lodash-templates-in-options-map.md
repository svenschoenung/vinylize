# Using lodash templates in options map

```js
var streamify = require('stream-array');
var vinylize = require('vinylize');
var vinylFs = require('vinyl-fs');

var books = [
  { title:'Dubliners', author:'James Joyce' },
  { title:'A Portrait of the Artist as a Young Man', author:'James Joyce' },
  { title:'Ulysses', author:'James Joyce' }
];

streamify(books)
  .pipe(vinylize({
    // the following are lodash templates
    // - data refers to current book
    // - options refers to this options map
    path: '<%= data.author %>/<%= data.title %><%= options.myExtension %>',
    contents: '<%= data.title %>\nWritten by <%= data.author %>',

    // the following are lodash templates as well,
    // but they don't use any "interpolate" delimiters,
    // so the result is a constant string
    myExtension: '.txt',
    base: './'
  }))
  .pipe(vinylFs.dest('books'));
```

## Result

**books/James Joyce/Dubliners.txt**

    A Book by James Joyce

**books/James Joyce/A Portrait of the Artist as a Young Man.txt**

    A Book by James Joyce

**books/James Joyce/Ulysses.txt**

    A Book by James Joyce
