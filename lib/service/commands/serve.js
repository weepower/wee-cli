const { prebuild } = require('../../utils/build');

module.exports = (api, options) => {
    api.registerCommand('serve', async (args) => {
        const webpack = require('webpack');
        const { info, clearConsole } = require('../../utils/log');

        let webpackConfig = api.resolveChainableWebpackConfig().toConfig();

        clearConsole();
        info('Starting development server...');

        return new Promise(async (resolve, reject) => {
            await prebuild(args, api, options);
            webpack(webpackConfig, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    });
};
