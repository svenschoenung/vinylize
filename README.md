[![npm Version](https://img.shields.io/npm/v/vinylize.svg)](https://www.npmjs.com/package/vinylize)
[![Build Status](https://travis-ci.org/svenschoenung/vinylize.svg?branch=master)](https://travis-ci.org/svenschoenung/vinylize)
[![Coverage Status](https://coveralls.io/repos/github/svenschoenung/vinylize/badge.svg?branch=master)](https://coveralls.io/github/svenschoenung/vinylize?branch=master)
[![Dependency Status](https://david-dm.org/svenschoenung/vinylize.svg)](https://david-dm.org/svenschoenung/vinylize)
[![devDependency Status](https://david-dm.org/svenschoenung/vinylize/dev-status.svg)](https://david-dm.org/svenschoenung/vinylize#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/svenschoenung/vinylize/badges/gpa.svg)](https://codeclimate.com/github/svenschoenung/vinylize)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/6e2e598556e44060a119e23deea3781b)](https://www.codacy.com/app/svenschoenung/vinylize)

# vinylize

Turn object streams into [`vinyl`](http://npmjs.com/package/vinyl) streams.

## Installation

    npm install vinylize

## Usage

The following turns each movie object into a [`vinyl`](http://npmjs.com/package/vinyl) file that can be wrapped in a [lodash template](https://lodash.com/docs#template) by [`gulp-wrap`](http://npmjs.com/package/gulp-wrap):

```js
var gulp = require('gulp');
var streamify = require('stream-array');
var vinylize = require('vinylize');
var friendlyUrl = require('friendly-url');
var wrap = require('gulp-wrap');

// this might come from a database or other data source
var movies = [
  { title:'2001: A Space Odyssey', director:'Stanley Kubrick', year:1968 },
  { title:'THX 1138', director:'George Lucas', year:1971 },
  { title:'Blade Runner', director:'Ridley Scott', year:1982 }
];

// you can use vinylize() in an existing stream
gulp.task('vinylize-pipe', function() {
  return streamify(movies)
    .pipe(vinylize({ path: function(movie) {
      return friendlyUrl(movie.title) + '.html';
    }}))
    .pipe(wrap('<h1><%= title %> (<%= year %>)</h1>\n' +
               '<div>Directed by: <%= director %></div>'))
    .pipe(gulp.dest('movies'));
});

// alternatively you can use vinylize() to create a new stream
gulp.task('vinylize-stream', function() {
  vinylize(movies, { path: function(movie) {
      return friendlyUrl(movie.title) + '.html';
    }})
    .pipe(wrap('<h1><%= title %> (<%= year %>)</h1>\n' +
               '<div>Directed by: <%= director %></div>'))
    .pipe(gulp.dest('movies'));
});

```

### Result

**movies/2001-a-space-odyssey.html**

    <h1>2001: A Space Odyssey (1968)</h1>
    <div>Directed by: Stanley Kubrick</div>

**movies/thx-1138.html**

    <h1>THX 1138 (1971)</h1>
    <div>Directed by: George Lucas</div>

**movies/blade-runner.html**

    <h1>Blade Runner (1982)</h1>
    <div>Directed by: Ridley Scott</div>

See the [examples](docs/examples) folder for more examples. 

## API

See the [API documentation](docs/API.md) for available functions and options.

## License

[MIT](LICENSE)
