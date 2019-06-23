module.exports = (api, options) => {
    const babelConfig = require('./config')(api);

    api.chainWebpack(config => {
        config.module
            .rule('js')
            .test(/\.js$/)
            .exclude
                .add(/node_modules(?!\/wee-core)/)
                .end()
            .use('babel')
                .loader('babel-loader')
                .options(babelConfig)
                .end();
    });
}
