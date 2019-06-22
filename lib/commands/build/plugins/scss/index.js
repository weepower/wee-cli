const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = (api) => {
    return new Promise((resolve, reject) => {
        api.chainWebpack(config => {

            // Process and extract css
            config.module
                .rule('extract-css')
                .test(/\.s?css$/)
                .use(MiniCssExtractPlugin.loader)
                    .loader(MiniCssExtractPlugin.loader)
                    .options({
                        publicPath: '../',
                    })
                    .end()
                .use('css-loader')
                    .loader('css-loader')
                    .options({
                        url: false,
                    })
                    .end()
                .use('postcss-loader')
                    .loader('postcss-loader')
                    .options({
                        config: {
                            path: path.resolve(__dirname),
                        },
                    })
                    .end()
                .use('sass-loader')
                    .loader('sass-loader')
                    .end()
                .use('sass-resources-loader')
                    .loader('sass-resources-loader')
                    .options({
                        resources: [
                            // TODO: move this to the cli probs
                            path.join(api.paths.project.basepath, 'temp/mixins.scss'),
                            path.join(api.paths.styles, 'variables.scss'),
                            path.join(api.paths.styles, 'mixins.scss'),
                        ],
                    })
                    .end();

            // Extract css
            config.plugin('extract-css')
                .use(MiniCssExtractPlugin, [{
                    filename: path.join('../styles', api.config.style.output.filename),
                    chunkFileName: path.join('../styles', api.config.style.output.chunkFilename),
                }])
                .end();

            // Lint styles
            config.plugin('stylelint')
                .use(StyleLintPlugin, [{
                    // Set context so we're not linting files in vendor or node_modules
                    context: api.paths.source,
                    configFile: path.resolve(__dirname, '.stylelintrc.js'),
                }])
                .end();

            resolve();
        });
    });
}
