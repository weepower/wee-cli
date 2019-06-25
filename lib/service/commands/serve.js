module.exports = (api, options) => {
    api.registerCommand('serve', {
        usage: 'wee serve [options]',
        options: {
            '--open': `open browser on server start`,
            '--copy': `copy url to clipboard on server start`,
            '--mode': `specify env mode (default: development)`,
        },
    }, async (args) => {
        const webpack = require('webpack');
        const { info, clearConsole } = require('../../utils/log');

        let webpackConfig = api.resolveChainableWebpackConfig().toConfig();

        clearConsole();
        info('Starting development server...\n\n');

        return new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                if (stats.hasErrors()) {
                    const jsonStats = stats.toJson();
                    let errors = '';

                    if (Array.isArray(jsonStats.errors)) {
                        errors = jsonStats.errors.join('\n\n');
                    } else {
                        errors = jsonStats.errors;
                    }

                    return reject(errors);
                }

                clearConsole();
                resolve();
            });
        });
    });
};
