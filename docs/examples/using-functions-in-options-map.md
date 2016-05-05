# Using functions in options map

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
    path: function(book) {         // function called for each book
      return book.author + '/' +
             book.title + '.txt';
    },
    contents: function(book) {     // function called for each book
      return new Buffer(
        book.title + '\n' + 
        'by ' + book.author);
    },
    base: function(book) {         // function called for each book
      return './';                 // however book value is never used
    }                              // could be a simple property instead
  }))
  .pipe(vinylFs.dest('books'));
```

## Result

**books/James Joyce/Dubliners.txt**

    Dubliners
    by James Joyce

**books/James Joyce/A Portrait of the Artist as a Young Man.txt**

    A Portrait of the Artist as a Young Man
    by James Joyce

**books/James Joyce/Ulysses.txt**

    Ulysses
    by James Joyce
