const chalk = require('chalk');
const { log, error } = require('../../utils/log');

function logUrls(urls, options) {
    log([
    `  ${chalk.bold(`${options.appName} running at:`)}`,
    `   - Local: ${chalk.cyan(urls.get('local'))}`,
    `   - Network: ${chalk.cyan(urls.get('external'))}`,
    `   - UI: ${chalk.cyan(urls.get('ui'))}`
    ].join('\n'));
    log();
}

module.exports = (api, options) => {
    api.chainWebpack(config => {
        config.watch(true);

        config
            .plugin('browser-sync')
            .use(require('browser-sync-webpack-plugin'), [{
                host: options.server.host === 'auto' ? null : options.server.host,
                port: options.server.port,
                ui: {
                    port: options.server.port + 1,
                    weinre: {
                        port: options.server.port + 100,
                    },
                },
                logLevel: 'silent',
                open: 'external',
                https: options.server.https,
                server: options.server.static ? api.service.paths.root : false,
                proxy: options.server.static ? false : options.server.proxy,
                logPrefix: 'Wee',
                logFileChanges: true,
            }, {
                callback(err, bs) {
                    if (err) {
                        error(err);
                    }

                    logUrls(bs.options.get('urls'), options);

                    bs.emitter.on('browser:reload', () => {
                        log();
                        logUrls(bs.options.get('urls'), options);
                    });
                }
            }]);
    });
};
