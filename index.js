var _ = require('lodash');
var path = require('path');
var isAbsolute = require('path-is-absolute');
var through = require('through2').obj;
var File = require('vinyl');
var streamify = require('stream-array');

function evaluateOptions(data, opts) {
  var options = {};
  Object.keys(opts).forEach(function(key) {
    if (_.isFunction(opts[key])) {
      options[key] = opts[key](data);
    } else if (_.isString(opts[key])) {
      options[key] = _.template(opts[key])({ data:data, options:opts });
    } else {
      options[key] = opts[key];
    }
  });
  if (!options.ignoreSourceProps && _.isPlainObject(data)) {
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

function vinylizePipe(optionsMap) {
  optionsMap = _.extend({
    ignoreSourceProps:false
  }, optionsMap);
  return through(function(data, encVinylize, doneWithVinylize) {
    if (File.isVinyl(data)) {
      this.push(data);
      doneWithVinylize();
      return;
    }
    var options = evaluateOptions(data, optionsMap);
    if (options.path) {
      options = sanitizePaths(options);
      options = sanitizeContents(options);
      var file = new File(options);
      file.data = data;
      this.push(file);
      doneWithVinylize();
      return;
    }
    doneWithVinylize('vinylize: missing path property in both ' +
                     'source object and options map');
  });
}

function vinylizeStream(sourceObjects, optionsMap) {
  return streamify(sourceObjects)
    .pipe(vinylizePipe(optionsMap));
}

function vinylize() {
  if (arguments.length === 0) {
    return vinylizePipe({});
  }
  if (arguments.length === 1) {
    if (_.isArray(arguments[0])) {
      return vinylizeStream(arguments[0], {});
    }
    if (_.isPlainObject(arguments[0])) {
      return vinylizePipe(arguments[0]);
    }
    throw new Error('vinylize: argument needs to be an ' +
                    'array of source objects or an options map');
  }
  if (arguments.length === 2) {
    if (!_.isArray(arguments[0])) {
      throw new Error('vinylize: first argument needs to be an ' +
                      'array of source objects');
    }
    if (!_.isPlainObject(arguments[1])) {
      throw new Error('vinylize: second argument needs to be an ' +
                      'options map');
    }
    return vinylizeStream(arguments[0], arguments[1]);
  }
  throw new Error('vinylize: illegal number of arguments ' +
                  '(' + arguments.length + ')');
}

module.exports = vinylize;
