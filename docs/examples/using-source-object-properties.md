# Using source object properties

```js
// source objects 
var books = [
  {
    title: 'Dubliners',
    author: 'James Joyce',
    path: 'src/james-joyce/dubliners.txt',
    base: './',
    contents: new Buffer('Dubliners\nWritten by James Joyce')
  },
  {
    title: 'A Portrait of the Artist as a Young Man',
    author: 'James Joyce',
    path: 'src/james-joyce/a-portrait-of-the-artist-as-a-young-man.txt',
    base: './',
    contents: new Buffer('A Portrait of the Artist\nWritten by James Joyce')
  },
  {
    title: 'Ulysses',
    author: 'James Joyce',
    path: 'src/james-joyce/ulysses.txt',
    base: './',
    contents: new Buffer('Ulysses\nWritten by James Joyce')
  }
];

streamify(books)
  .pipe(vinylize({
     base: 'src/'    // overwrites source object .base property
  }))
  .pipe(vinylFs.dest('books'))
```

## Result

**books/james-joyce/dubliners.txt**

    Dubliners
    Written by James Joyce

**books/james-joyce/a-portrait-of-the-artist-as-a-young-man.txt**

    A Portrait of the Artist as a Young Man
    Written by James Joyce

**books/james-joyce/ulysses.txt**

    Ulysses
    Written by James Joyce
