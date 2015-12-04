'use strict';

var assert = require("assert");
var exec = require('child_process').exec;
var path = require('path');
var express_app = require('./testserver/express_app');
var streamify = require('stream-array');
var os = require('os');
var through = require('through');

var program = {
    log: {
        debug: function(x){},
        log: function(x){},
    }

};
var filters = require('../utils/filters')(program);

var urlReadStream;
var urls = [
    'http://localhost:8081/aboutasdf.html',
    'http://localhost:8081/google.html',
    'http://localhost:8081/zombocom.html',
];

describe('filters', function () {

    beforeEach(function () {
        urlReadStream = streamify(urls)
    });

    it('grep: sould filter urls with by keyword', function (done) {
        var testCase = through(function write(data) {
            assert.equal('http://localhost:8081/zombocom.html', data);
            done();
        });

        urlReadStream
            .pipe(filters.grep('zombo'))
            .pipe(testCase);

    });

    it('grepV: should exclude urls with by keyword', function (done) {
        var testCase = through(function write(data) {
            assert.equal('http://localhost:8081/google.html', data);
            done();
        });

        urlReadStream
            .pipe(filters.grepV('aboutasdf'))
            .pipe(testCase);

    });

    it('term: should filter out urls with a keyword', function (done) {
        var server = express_app.listen(8081);
        var testCase = through(function write(data) {
            assert.equal('http://localhost:8081/aboutasdf.html', data);
            done();
            server.close();
        });

        urlReadStream
            .pipe(filters.term('asdf@asdf.com'))
            .pipe(testCase);

    });

    it('term: should filter out urls with a keyword', function (done) {
        var server = express_app.listen(8081);
        var testCase = through(function write(data) {
            assert.equal('http://localhost:8081/aboutasdf.html', data);
            done();
            server.close();
        });

        urlReadStream
            .pipe(filters.term('asdf@asdf.com'))
            .pipe(testCase);

    });

    it('term: should return pages matching a queryselector', function (done) {
        var server = express_app.listen(8081);
        var testCase = through(function write(data) {
            assert.equal('http://localhost:8081/google.html', data);
            done();
            server.close();
        });

        urlReadStream
            .pipe(filters.selector('#gbar'))
            .pipe(testCase);

    });
});
