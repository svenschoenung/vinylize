# Using values in options map

```js
var streamify = require('stream-array');
var vinylize = require('vinylize');
var vinylFs = require('vinyl-fs');

var books = [
  {
    title: 'Dubliners',
    author: 'James Joyce',
    path: 'src/james-joyce/dubliners.txt',
  },
  {
    title: 'A Portrait of the Artist as a Young Man',
    author: 'James Joyce',
    path: 'src/james-joyce/a-portrait-of-the-artist-as-a-young-man.txt',
  },
  {
    title: 'Ulysses',
    author: 'James Joyce',
    path: 'src/james-joyce/ulysses.txt',
  }
];

var text = 'Once upon a time and a very good time it was\n' +
           'there was a moocow coming down along the road';

streamify(books)
  .pipe(vinylize({
    base: 'src',                     // Use same base path for every file
    contents: new Buffer(text)       // Use same contents for every file
  }))
  .pipe(vinylFs.dest('books'));
```

## Results

**books/james-joyce/dubliners.txt**

    Once upon a time and a very good time it was
    there was a moocow coming down along the road

**books/james-joyce/a-portrait-of-the-artist-as-a-young-man.txt**

    Once upon a time and a very good time it was
    there was a moocow coming down along the road

**books/james-joyce/ulysses**

    Once upon a time and a very good time it was
    there was a moocow coming down along the road
