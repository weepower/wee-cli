module.exports = (api, options) => {
    api.chainWebpack(config => {
        // Copy fonts and images
        const ignore = [
            '.gitkeep',
            '.DS_Store',
        ];

        // Copy fonts and images
        config.plugin('copy-webpack')
            .use(require('copy-webpack-plugin'), [[
                { from: api.service.paths.images, to: api.service.paths.output.images, ignore },
                { from: api.service.paths.fonts, to: api.service.paths.output.fonts, ignore },
            ], {
                copyUnmodified: true,
            }]);
    });
}
