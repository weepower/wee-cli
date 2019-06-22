const path = require('path');
const DefineWebpackPlugin = require('webpack/lib/DefinePlugin');

module.exports = (api) => {
    return new Promise((resolve, reject) => {
        api.chainWebpack(config => {
            const env = (api.env === 'staging') ? 'development' : api.env;

            config.resolve
                .modules
                    .add(path.join(api.paths.weeCore, 'scripts'))
                    .add(api.paths.nodeModules);

            // Shims
            config.node
                .merge({
                    setImmediate: false,
                    process: 'mock',
                    dgram: 'empty',
                    fs: 'empty',
                    net: 'empty',
                    tls: 'empty',
                    child_process: 'empty',
                });

            config.mode(env);

            // Define ENV
            config.plugin('define')
                .use(DefineWebpackPlugin, [{
                    'process.env': env,
                }]);

            resolve();
        });
    });
}
