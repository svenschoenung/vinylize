var util = require('util');
var path = require('path');
var template = require('lodash.template');

var through = require('through2').obj;
var vinyl = require('vinyl-fs');
var File = require('vinyl');

function createOptions(obj, opts) {
  var options = {};
  Object.keys(opts || {}).forEach(function(key) {
    if (util.isFunction(opts[key])) {
      options[key] = opts[key](obj);
    } else if (util.isString(opts[key])) {
      options[key] = template(opts[key])({obj:obj, options:opts});
    } else {
      options[key] = opts[key];
    }
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
