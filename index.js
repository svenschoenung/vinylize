var _ = require('lodash');
var path = require('path');
var isAbsolute = require('path-is-absolute');
var through = require('through2').obj;
var File = require('vinyl');

function evaluateOptions(data, opts) {
  var options = {};
  Object.keys(opts || {}).forEach(function(key) {
    if (_.isFunction(opts[key])) {
      options[key] = opts[key](data);
    } else if (_.isString(opts[key])) {
      options[key] = _.template(opts[key])({ data:data, options:opts });
    } else {
      options[key] = opts[key];
    }
  });
  if (_.isPlainObject(data)) {
    options = _.extend({}, data, options);
  }
  return options;
}

function sanitizePaths(options) {
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  if (!isAbsolute(options.path)) {
    options.path = path.resolve(options.cwd, options.path);
  }
  if (!options.base) {
    options.base = path.dirname(options.path);
  }
  if (!isAbsolute(options.base)) {
    options.base = path.resolve(options.cwd, options.base);
  }
  if (options.base.length > 0 &&
      options.base[options.base.length - 1] !== '/') {
    options.base += '/';
  }
  return options;
}

function sanitizeContents(options) {
  if (_.isString(options.contents)) {
    options.contents = new Buffer(options.contents);
  }
  if (!options.contents) {
    options.contents = new Buffer('');
  }
  return options;
}

function vinylize(opts) {
  return through(function(data, encVinylize, doneWithVinylize) {
    var options = evaluateOptions(data, opts);
    if (options.path) {
      options = sanitizePaths(options);
      options = sanitizeContents(options);
      var file = new File(options);
      file.data = data;
      this.push(file);
      doneWithVinylize();
      return;
    }
    doneWithVinylize('Missing path property in options');
  });
}

module.exports = vinylize;
