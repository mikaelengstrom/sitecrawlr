"use strict";
var through = require('through');
var http = require('http');
var cheerio = require('cheerio');

var getUrl = function getUrl(url, cb_done, cb_error) {
    http.get(url, function (response) {

        if (response.statusCode == 200) {
            var body = '';

            response.on('data', function (chunk) {
                body += chunk;
            });

            response.on('end', function () {
                cb_done(body);
            });
        }

    }).on('error', function (e) {
        cb_error(e);
    });
};

module.exports = function(program) {
    return {
        grep: function (keyword) {
            return through(function write(data) {
                var termRegex = new RegExp(keyword);
                if (data.match(termRegex)) {
                    this.queue(data);
                }
            });
        },
        grepV: function (keyword) {
            return through(function write(data) {
                var termRegex = new RegExp(keyword);
                if (!data.match(termRegex)) {
                    this.queue(data);
                }
            });
        },
        term: function (term) {
            return through(function write(url) {
                var self = this;

                self.pause();
                program.log.debug('Requestion url ' + url);

                getUrl(url, function(body){
                    program.log.debug('Got response for ' + url);
                    if (body.indexOf(term) >= 0) {
                        self.queue(url);
                    }

                    self.resume();

                }, function(e){
                    program.log.debug('Error for ' + url + ':' + e.message);
                    self.resume();
                });

            });
        },
        selector: function (selector) {
            return through(function write(url) {
                var self = this;

                self.pause();
                program.log.debug('Requestion url ' + url);

                getUrl(url, function(body){
                    program.log.debug('Got response for ' + url);
                    var qs = cheerio.load(body);
                    if (qs(selector).length) {
                        self.queue(url);
                    }

                    self.resume();

                }, function(e){
                    program.log.debug('Error for ' + url + ':' + e.message);
                    self.resume();
                });

            });
        }
    }
}
