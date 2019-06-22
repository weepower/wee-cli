const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = api => new Promise((resolve, reject) => {
    // Copy fonts and images
    const copyWebpackIgnore = [
        '.gitkeep',
        '.DS_Store',
    ];

    api.chainWebpack(config => {
        // Copy fonts and images
        config.plugin('copy-webpack')
            .use(CopyWebpackPlugin, [[
                { from: api.paths.images, to: api.paths.output.images, ignore: copyWebpackIgnore },
                { from: api.paths.fonts, to: api.paths.output.fonts, ignore: copyWebpackIgnore },
            ], {
                copyUnmodified: true,
            }]);
    });

    resolve();
});
