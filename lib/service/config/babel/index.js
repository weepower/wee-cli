module.exports = (api, options) => {
    api.chainWebpack(config => {
        config.module
            .rule('js')
            .test(/\.js$/)
            .exclude
                .add(/node_modules(?!\/@weepower\/core)/)
                .end()
            .use('babel')
                .loader('babel-loader')
                .end();
    });
}
