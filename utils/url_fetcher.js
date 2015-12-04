'use strict';

var url = require('url');
var http = require('http');
var async = require('async');
var XmlStream = require('xml-stream');

module.exports = function(program) {

    function getUrls(sitemap_or_host_url, cb) {
        var is_xml_file = sitemap_or_host_url.match(/\.xml$/);
        if (is_xml_file) {
            getSitemapLocations(sitemap_or_host_url, cb);
            return;
        }

        program.log.debug('Supplied argument is not a sitemap, trying common sitemap locations');

        var possible_sitemap_paths = ['/sitemap.xml', '/sitemap_index.xml'];

        possible_sitemap_paths.forEach(function(possible_sitemap_path){
            var endpoint = url.resolve(sitemap_or_host_url, possible_sitemap_path);
            getSitemapLocations(endpoint, cb);
        });

    }

    function getSitemapLocations(endpoint, cb) {
        program.log.debug('Requesting sitemap from ' + endpoint)

        http.get(endpoint, function (response) {
            if (response.statusCode == 200) {
                program.log.debug('Found sitemap ' + endpoint)

                response.setEncoding('utf8');
                var xml = new XmlStream(response);

                var sitemapUrls = [];
                xml.collect('sitemap > loc');
                xml.on('endElement: sitemap > loc', function(loc) {
                    sitemapUrls.push(loc.$text);
                });

                var urls = [];
                xml.collect('url > loc');
                xml.on('endElement: url > loc', function(loc) {
                    urls.push(loc.$text);
                });


                xml.on('end', function() {
                    // If we hit a sitemap index, do recursive call calls
                    if (sitemapUrls.length) {
                        program.log.debug('Found sitemap index, crawling.');

                        async.map(sitemapUrls, getSitemapLocations, function(err, result) {
                            var merged = [].concat.apply([], result);
                            cb(null, merged);
                        });
                    } else if (urls) {
                        cb(null, urls);
                    } else {
                        program.log.error('Found no urls at ' + endpoint);
                    }
                });

            }

        }).on('error', function (e) {
            program.log.error(e.message);
        });
    }

    return {
        getUrls: getUrls
    };
}

