const fs = require('fs');
const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack(config => {
        const userConfigPath = path.join(api.service.context, 'babel.config.js');
        let babelConfig = require('./config')(api);

        if (fs.existsSync(userConfigPath)) {
            babelConfig = require(userConfigPath);
        }

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
