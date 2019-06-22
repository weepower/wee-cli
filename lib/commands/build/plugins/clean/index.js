const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        // Delete contents of output directory
        config.plugin('clean-webpack')
            .use(CleanWebpackPlugin, [{
                cleanOnceBeforeBuildPatterns: [
                    `${api.paths.output.fonts}/*`,
                    `${api.paths.output.images}/*`,
                    `${api.paths.output.scripts}/*`,
                    `${api.paths.output.styles}/*`,
                ],
            }], {
                root: api.paths.project,
                watch: true,
            })
            .end();

        // Clean output directory
        config.plugin('clean-obsolete-chunks')
            .use(CleanObsoleteChunks, [{
                deep: true,
            }])
            .end();
    });

    resolve();
});
