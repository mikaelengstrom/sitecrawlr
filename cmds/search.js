'use strict';
module.exports = function (program) {
    var through = require('through');
    var streamify = require('stream-array');
    var http = require('http');
    var os = require('os');


    var filter = require(__dirname + '/../utils/filters')(program);

    program
        .command('search <host_or_sitemap_url>')
        .option('-t, --term <term>', 'Filter the result list based on a search term in body. e.g. "About"')
        .option('-s, --selector <selector>', 'Filter the result list based on a zepto/jquery compatible css selector eg. ".header .logo"')
        .option('-g, --grep <term>', 'Only return requests with urls matching term')
        .option('-v, --grep-v <term>', 'Do not return requests with urls matching term')
        .version('0.0.1')
        .description('Search a site for a term or selector')
        .action(function (host_or_sitemap_url, options) {
            var url_fetcher = require('../utils/url_fetcher.js')(program);

            program.log.debug('Trying to fetch sitemaps from ' + host_or_sitemap_url);

            url_fetcher.getUrls(host_or_sitemap_url, filterAndOutputUrls);

            function filterAndOutputUrls(err, urls) {

                var urlReadStream = streamify(urls);
                urlReadStream.setEncoding('utf8');

                if (options.grep) {
                    urlReadStream = urlReadStream.pipe(filter.grep(options.grep))
                }

                if (options.grepV) {
                    urlReadStream = urlReadStream.pipe(filter.grepV(options.grepV))
                }

                if (options.term) {
                    urlReadStream = urlReadStream.pipe(filter.term(options.term))
                }

                if (options.selector) {
                    urlReadStream = urlReadStream.pipe(filter.selector(options.selector))
                }

                urlReadStream.pipe(addLineBreaks).pipe(process.stdout);
            }

            var addLineBreaks = through(function write(data) {
                this.queue(data + os.EOL);
            });
        });
};
