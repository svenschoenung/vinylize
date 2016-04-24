'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var vinylize = require('./index.js');

var streamify = require('stream-array');
var through = require('through2').obj;
var isVinyl = require('vinyl').isVinyl; 

function collect(files) {
  return through(function(file, enc, cb) {
    files.push(file);
    cb();
  });
}

describe('vinylize()', function() {
  it('requires glob or path in options', function() {
    expect(vinylize.bind(null)).to.throw(Error);
    expect(vinylize.bind(null, {})).to.throw(Error);
    expect(vinylize.bind(null, { path:'' })).not.to.throw(Error);
    expect(vinylize.bind(null, { glob:'' })).not.to.throw(Error);
  });
  it('requires glob or path function to return non-null', function(done) {
    streamify([{}])
      .pipe(vinylize({
         glob: function() { return null; },
         path: function() { return null; }
      }))
      .on('error', function(error) {
	 expect(error).not.to.equal(null);
	 done();
      })
      .on('finish', function() {
	 assert.fail('finish', 'error', 'expected error event in pipe');
	 done();
      });
  });
});


describe('vinylize({path:...})', function() {
  it('should create vinyl file with given absolute path', function(done) {
    var files = [];
    var obj = {};
    streamify([obj])
      .pipe(vinylize({path: '/foo/bar.js'}))
      .pipe(collect(files))
      .on('finish', function() {
	 expect(files).to.have.length.of(1);
	 expect(isVinyl(files[0])).to.equal(true);
	 expect(files[0].contents).to.equal(null);
	 expect(files[0].path).to.equal('/foo/bar.js');
	 expect(files[0].cwd).to.equal(process.cwd());
	 expect(files[0].base).to.equal(process.cwd());
	 expect(files[0].data).to.equal(obj);
	 done();
      });
  });
  it('should make relative paths absolute', function(done) {
    var files = [];
    var obj = {};
    streamify([obj])
      .pipe(vinylize({path: 'foo/bar.js'}))
      .pipe(collect(files))
      .on('finish', function() {
	 expect(files).to.have.length.of(1);
	 expect(isVinyl(files[0])).to.equal(true);
	 expect(files[0].contents).to.equal(null);
	 expect(files[0].path).to.equal(process.cwd() + '/foo/bar.js');
	 expect(files[0].cwd).to.equal(process.cwd());
	 expect(files[0].base).to.equal(process.cwd());
	 expect(files[0].data).to.equal(obj);
	 done();
      });
  });
  it('should use cwd option to resolve absolute path', function(done) {
    var files = [];
    var obj = {};
    streamify([obj])
      .pipe(vinylize({path: 'foo/bar.js', cwd: '/path/'}))
      .pipe(collect(files))
      .on('finish', function() {
	 expect(files).to.have.length.of(1);
	 expect(isVinyl(files[0])).to.equal(true);
	 expect(files[0].contents).to.equal(null);
	 expect(files[0].path).to.equal('/path/foo/bar.js');
	 expect(files[0].cwd).to.equal('/path/');
	 expect(files[0].base).to.equal('/path/');
	 expect(files[0].data).to.equal(obj);
	 done();
      });
  });
  it('should invoke functions in options and use return values', function(done) {
    var files = [];
    var obj = { myCwd: '/path/', myPath:'foo/bar.js'};
    streamify([obj])
      .pipe(vinylize({
	 path: function(obj) { return obj.myPath; },
	 cwd: function(obj) { return obj.myCwd; }
      }))
      .pipe(collect(files))
      .on('finish', function() {
	 expect(files).to.have.length.of(1);
	 expect(isVinyl(files[0])).to.equal(true);
	 expect(files[0].contents).to.equal(null);
	 expect(files[0].path).to.equal('/path/foo/bar.js');
	 expect(files[0].cwd).to.equal('/path/');
	 expect(files[0].base).to.equal('/path/');
	 expect(files[0].data).to.equal(obj);
	 done();
      });
  });



});
