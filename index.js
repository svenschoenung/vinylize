var isFunction = require('util').isFunction;
var isNullOrUndefined = require('util').isNullOrUndefined;
var path = require('path');

var through = require('through2').obj;
var vinyl = require('vinyl-fs');
var File = require('vinyl');

function validateOptions(opts) {
  if (isNullOrUndefined(opts) ||
      (isNullOrUndefined(opts.glob) &&
       isNullOrUndefined(opts.path))) {
    throw new Error('Either options.glob or options.path is required');
  }
}

function createOptions(obj, opts) {
  var options = {};
  Object.keys(opts).forEach(function(key) {
    options[key] = (isFunction(opts[key])) ? opts[key](obj) : opts[key];
  });
  return options;
}

function sanitizeOptions(options) {
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  if (!path.isAbsolute(options.path)) {
    options.path = path.resolve(options.cwd, options.path);
  }
  return options;
}

function vinylize(opts) {
  validateOptions(opts);
  return through(function(obj, enc, doneWithVinylize) {
    var options = createOptions(obj, opts);
    if (options.glob) {
      var self = this;
      vinyl.src(options.glob, options)
        .pipe(through(function(file, enc, doneWithVinylFs) {
          file.data = obj;
          self.push(file);
        }))
        .on('finish', doneWithVinylize);
      return;
    }
    if (options.path) {
      var file = new File(sanitizeOptions(options));
      file.data = obj;
      this.push(file);
      doneWithVinylize();
      return;
    }
    doneWithVinylize('Either options.glob or options.path is required');
  });
}

module.exports = vinylize;
