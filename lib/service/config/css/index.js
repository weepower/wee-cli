const path = require('path');
const fs = require('fs');

module.exports = (api, options) => {
    api.chainWebpack(config => {
        const re = /\.s?css$/;
        const userConfigFile = path.resolve(api.service.context, '.postcssrc.js');
        let configPath = path.resolve(__dirname);

        if (fs.existsSync(userConfigFile)) {
            configPath = path.resolve(api.service.context);
        }

        // Extract
        config.module
            .rule('extract-css')
            .test(re)
            .use('extract-css-loader')
                .loader(require('mini-css-extract-plugin').loader)
                .end();

        // CSS loader
        config.module
            .rule('css')
            .test(re)
            .use('css-loader')
            .loader('css-loader')
            .options({
                url: false,
            })
            .end();

        // Postcss loader
        config.module
            .rule('postcss')
            .test(re)
            .use('postcss-loader')
            .loader('postcss-loader')
            .options({
                config: {
                    path: configPath,
                },
            })
            .end();

        // Sass loader
        config.module
            .rule('sass')
            .test(re)
            .use('sass-loader')
            .loader('sass-loader')
            .end();

        config.module
            .rule('sass-resources')
            .test(re)
            .use('sass-resources-loader')
            .loader('sass-resources-loader')
            .options({
                resources: [
                    // TODO:
                    path.resolve(api.service.paths.weeCore, 'styles/temp/mixins.scss'),

                    // TODO:
                    api.resolve(`source/styles/variables.scss`),
                    api.resolve(`source/styles/mixins.scss`),
                ],
            })
            .end();

        // Extract css
        config.plugin('extract-css')
            .use(require('mini-css-extract-plugin'), [{
                filename: path.join('../styles', options.style.output.filename),
                chunkFileName: path.join('../styles', options.style.output.chunkFilename),
            }])
            .end();
    });
}
