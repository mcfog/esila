var Promise = require('bluebird');
var prequest = Promise.promisify(require('request'));
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = {
    getMenuOfRestaurant: function(r) {
        return prequest({
            url: 'http://r.ele.me/' + r
        })
            .spread(function(res) {
                return cheerio.load(res.body);
            })
            .then(function($) {
                return $('script').map(function() {
                    var $src = $(this);
                    if($src.attr('src')) return;

                    var menu = $src.html().match(/var menu = (\[.+\]);/);

                    if(!menu) return;

                    try {
                        return JSON.parse(menu[1]);
                    } catch(e) {
                        return;
                    }

                }).get();
            })
            .then(function(cats) {
                return _(cats)
                    .map(function(cat) {
                        return [].concat(cat.foods.with_image, cat.foods.without_image);
                    })
                    .flatten()
                    .value();
            })
    }
};
