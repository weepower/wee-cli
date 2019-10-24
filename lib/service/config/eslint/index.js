module.exports = (api, options) => {
    api.chainWebpack((config) => {
        // Lint JS/Vue files
        config.module
            .rule('lint')
            .pre()
            .test(/\.(vue|(j|t)sx?)$/)
            .exclude
                .add(/node_modules/)
                .end()
            .include
                .add(api.service.paths.scripts)
                .add(api.service.paths.components)
                .end()
            .use('eslint')
                .loader('eslint-loader')
                .options({
                    formatter: require('eslint/lib/cli-engine/formatters/codeframe'),
                    configFile: api.resolve('.eslintrc.js'),
                })
                .end();
    });
}
