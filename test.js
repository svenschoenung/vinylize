'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var vinylize = require('./index.js');

var streamify = require('stream-array');
var through = require('through2').obj;
var File = require('vinyl');

function collect(files) {
  return through(function(file, enc, cb) {
    files.push(file);
    cb();
  });
}

describe('vinylize()', function() {
  it('requires source object array and/or options map',
    function() {
      expect(vinylize.bind(null, false)).to.throw(Error);
      expect(vinylize.bind(null, [], false)).to.throw(Error);
      expect(vinylize.bind(null, false, {})).to.throw(Error);
      expect(vinylize.bind(null, [], {}, false)).to.throw(Error);
    });
  it('requires path property in source object or options map',
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
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path0/foo0/bar0.js');
          expect(files[0].cwd).to.equal('/path0/');
          expect(files[0].base).to.equal('/path0/foo0/');
          expect(files[0].data).to.equal(obj0);
          expect(File.isVinyl(files[1])).to.equal(true);
          expect(files[1].contents.toString()).to.equal('');
          expect(files[1].path).to.equal('/path1/foo1/bar1.js');
          expect(files[1].cwd).to.equal('/path1/');
          expect(files[1].base).to.equal('/path1/foo1/');
          expect(files[1].data).to.equal(obj1);
          done();
        });
    });
  it('should render string options with lodash.template',
    function(done) {
      var files = [];
      var obj0 = { myCwd: '/path0/', myPath:'foo0/bar0'};
      var obj1 = { myCwd: '/path1/', myPath:'foo1/bar1'};
      streamify([obj0, obj1])
        .pipe(vinylize({
          path:'<%= data.myPath %><%= options.myExt[0] %>',
          cwd:'<%= data.myCwd %>',
          myExt: ['.js']
        }))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(2);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path0/foo0/bar0.js');
          expect(files[0].cwd).to.equal('/path0/');
          expect(files[0].base).to.equal('/path0/foo0/');
          expect(files[0].data).to.equal(obj0);
          expect(File.isVinyl(files[1])).to.equal(true);
          expect(files[1].contents.toString()).to.equal('');
          expect(files[1].path).to.equal('/path1/foo1/bar1.js');
          expect(files[1].cwd).to.equal('/path1/');
          expect(files[1].base).to.equal('/path1/foo1/');
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
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/foo/');
          expect(files[0].data).to.equal(0);
          done();
        });
    });
  it('should create vinyl file with absolute path from data object',
    function(done) {
      var files = [];
      var obj = {path:'/foo/bar.js'};
      streamify([obj])
        .pipe(vinylize())
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal('/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should create vinyl file with absolute path from options',
    function(done) {
      var files = [];
      var obj = {};
      streamify([obj])
        .pipe(vinylize({path: '/foo/bar.js'}))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal('/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should use absolute base options for vinyl files',
    function(done) {
      var files = [];
      var obj = {};
      streamify([obj])
        .pipe(vinylize({path: '/foo/bar.js', base:'/'}))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal('/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should use contents option for vinyl files',
    function(done) {
      var files = [];
      var obj = {};
      streamify([obj])
        .pipe(vinylize({path: '/foo/bar.js', contents: new Buffer('x')}))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('x');
          expect(files[0].path).to.equal('/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal('/foo/');
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
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal(process.cwd() + '/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal(process.cwd() + '/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should make relative base paths absolute',
    function(done) {
      var files = [];
      var obj = {};
      streamify([obj])
        .pipe(vinylize({path: 'foo/bar.js', base:'foo'}))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal(process.cwd() + '/foo/bar.js');
          expect(files[0].cwd).to.equal(process.cwd());
          expect(files[0].base).to.equal(process.cwd() + '/foo/');
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
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should turn string contents into a buffer',
    function(done) {
      var files = [];
      var obj = {};
      streamify([obj])
        .pipe(vinylize({
           path: 'foo/bar.js',
           cwd: '/path/',
           contents: 'text'
        }))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents).to.have.be.instanceOf(Buffer);
          expect(files[0].contents.toString()).to.equal('text');
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should pass existing vinyl files through unchanged',
    function(done) {
      var files = [];
      var file = new File({
         path: '/foo/bar.js'
      });
      streamify([file])
        .pipe(vinylize())
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(files[0]).to.equal(file);
          done();
        });
    });
  it('should create stream from source object array',
    function(done) {
      var files = [];
      var obj = {
           path: 'foo/bar.js',
           cwd: '/path/',
      };
      vinylize([obj])
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should create stream from source object array and options map',
    function(done) {
      var files = [];
      var obj = {};
      vinylize([obj], {
          path: 'foo/bar.js',
          cwd: '/path/',
        })
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path/foo/bar.js');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/foo/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
  it('should honor useSourceObjectProps option',
    function(done) {
      var files = [];
      var obj = { contents:'Test' };
      streamify([obj])
        .pipe(vinylize({
          ignoreSourceProps:true,
          cwd:'/path/',
          path:'foo.txt',
        }))
        .pipe(collect(files))
        .on('finish', function() {
          expect(files).to.have.length.of(1);
          expect(File.isVinyl(files[0])).to.equal(true);
          expect(files[0].contents.toString()).to.equal('');
          expect(files[0].path).to.equal('/path/foo.txt');
          expect(files[0].cwd).to.equal('/path/');
          expect(files[0].base).to.equal('/path/');
          expect(files[0].data).to.equal(obj);
          done();
        });
    });
});
