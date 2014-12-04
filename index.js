var Promise = require('bluebird');
var prequest = Promise.promisify(require('request'));
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = {
    getMenuOfRestaurant: function(r) {
        var url = 'http://r.ele.me/' + r;
        return prequest({
            url: url,
            headers: {
                'User-Agent': 'request'
            }
        })
            .bind({url: url})
            .spread(function(res) {
                return cheerio.load(res.body);
            })
            .then(function($) {
                this.name = $('.rst-name').text();

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
                this.items = _(cats)
                    .map(function(cat) {
                        return [].concat(cat.foods.with_image, cat.foods.without_image);
                    })
                    .flatten()
                    .value();

                return this;
            })
    }
};
