var _ = require('lodash');
var path = require('path');

var through = require('through2').obj;
var vinyl = require('vinyl-fs');
var File = require('vinyl');

function createOptions(data, opts) {
  var options = {};
  Object.keys(opts || {}).forEach(function(key) {
    if (_.isFunction(opts[key])) {
      options[key] = opts[key](data);
    } else if (_.isString(opts[key])) {
      options[key] = _.template(opts[key])({data:data, options:opts});
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
  return through(function(data, enc, doneWithVinylize) {
    var options = createOptions(data, opts);
    if (_.isPlainObject(data)) {
      options = _.extend({}, data, options);
    }
    if (options.glob) {
      var self = this;
      vinyl.src(options.glob, options)
        .pipe(through(function(file, enc, doneWithVinylFs) {
          file.data = data;
          self.push(file);
        }))
        .on('finish', doneWithVinylize);
      return;
    }
    if (options.path) {
      var file = new File(sanitizeOptions(options));
      file.data = data;
      this.push(file);
      doneWithVinylize();
      return;
    }
    doneWithVinylize('Either options.glob or options.path is required');
  });
}

module.exports = vinylize;
