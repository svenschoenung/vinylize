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
  it('requires options.glob or options.path',
    function(done) {
      streamify([{}])
        .pipe(vinylize())
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
  it('should create vinyl file with given absolute path',
    function(done) {
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
  it('should make relative paths absolute',
    function(done) {
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
  it('should use cwd option to resolve absolute path',
    function(done) {
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
  it('should invoke functions in options and use return values',
    function(done) {
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
  it('should invoke functions in options and use return values',
    function(done) {
      var files = [];
      var obj0 = { myCwd: '/path0/', myPath:'foo0/bar0.js'};
      var obj1 = { myCwd: '/path1/', myPath:'foo1/bar1.js'};
      streamify([obj0, obj1])
        .pipe(vinylize({
          path: function(obj) { return obj.myPath; },
          cwd: function(obj) { return obj.myCwd; }
        }))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(2);
          expect(isVinyl(files[0])).to.equal(true);
          expect(files[0].contents).to.equal(null);
          expect(files[0].path).to.equal('/path0/foo0/bar0.js');
          expect(files[0].cwd).to.equal('/path0/');
          expect(files[0].base).to.equal('/path0/');
          expect(files[0].data).to.equal(obj0);
          expect(isVinyl(files[1])).to.equal(true);
          expect(files[1].contents).to.equal(null);
          expect(files[1].path).to.equal('/path1/foo1/bar1.js');
          expect(files[1].cwd).to.equal('/path1/');
          expect(files[1].base).to.equal('/path1/');
          expect(files[1].data).to.equal(obj1);
          done();
        });
    });
  it('should be able to handle non-objects',
    function(done) {
      var files = [];
      streamify([0])
        .pipe(vinylize({ cwd: '/path/', path:'foo/bar.js'}))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(isVinyl(files[0])).to.equal(true);
          expect(files[0].contents).to.equal(null);
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/');
          expect(files[0].data).to.equal(0);
          done();
        });
    });

});
