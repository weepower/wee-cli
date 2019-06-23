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
                open: 'external',
                https: options.server.https,
                server: options.server.static ? api.service.paths.root : false,
                proxy: options.server.static ? false : options.server.proxy,
                logPrefix: 'Wee',
                logFileChanges: true,
            }]);
    });
};
