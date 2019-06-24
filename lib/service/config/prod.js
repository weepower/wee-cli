module.exports = (api, options) => {
    api.chainWebpack(config => {
        if (process.env.NODE_ENV === 'production') {
            config
                .mode('production')
                .devtool('source-map');

            // keep module.id stable when vendor modules does not change
            config
                .plugin('hash-module-ids')
                .use(require('webpack/lib/HashedModuleIdsPlugin'));

            const UglifyPlugin = require('uglifyjs-webpack-plugin');
            const uglifyOptions = require('./uglifyOptions')(options)
            config.optimization
                .nodeEnv(api.service.mod)
                .minimizer('uglify-js')
                .use(UglifyPlugin, [uglifyOptions]);

            const imageminMozjpeg = require('imagemin-mozjpeg');
            config.plugin('imagemin')
                .use(require('imagemin-webpack-plugin').default, [{
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    plugins: [
                        imageminMozjpeg({
                            quality: 99,
                            progressive: true
                        }),
                    ],
                    pngquant: {
                        quality: '99',
                        test: /\.(jpe?g|png|gif|svg)$/i,
                    },
                }]);
        }
    });
}
