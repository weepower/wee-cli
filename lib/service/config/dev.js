module.exports = (api, options) => {
    api.chainWebpack(config => {
        if (process.env.NODE_ENV === 'development') {
            config.devtool('cheap-module-eval-source-map');
        }
    });
}
