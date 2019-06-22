const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        // Delete contents of output directory
        config.plugin('clean-webpack')
            .use(CleanWebpackPlugin, [[
                paths.output.fonts,
                paths.output.images,
            ], {
                root: paths.project,
                watch: true,
            }])
            .end();
    });

    resolve();
});
