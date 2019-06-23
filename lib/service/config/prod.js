module.exports = (api, options) => {
    api.chainWebpack(config => {
        if (process.env.NODE_ENV === 'production') {
            config
                .mode('production')
                .devtool('source-map');

            // keep module.id stable when vendor modules does not change
            config
                .plugin('hash-module-ids')
                  .use(require('webpack/lib/HashedModuleIdsPlugin'))
        }
    });
}
