# Sitecrawlr

## Description
Crawl sitemaps and filter the url-list based on query selectors or search terms

## Usage

To install sitecrawlr from npm, run:

```
$ npm install -g sitecrawlr
```

```node ./bin/sitecrawlr --help```

## Testing

```
mocha test
```

## Todo

- [ ] Move the list-function to a separate command
- [ ] Make the search command accept input from std-in
- [ ] Make the search engine accept regexes
- [ ] Add ignore-case possibillity to search command
- [ ] Find out a more serious approach to test the stream filters
- [ ] Add some examples to the README
- [ ] Make the url-search run in paralell to speed things up


## License

Copyright (c) 2015 Mikael Engström

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

