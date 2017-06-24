var cssnext = require('postcss-cssnext');
var hexRgba = require('postcss-hexrgba');

module.exports = {
    plugins: [
        cssnext({
            browsers: [
                '>1%',
                'last 2 versions',
                'not ie <= 8'
            ]
        }),
        hexRgba
    ]
};
