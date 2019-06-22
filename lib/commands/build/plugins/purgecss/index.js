const PurgecssPlugin = require('purgecss-webpack-plugin');

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        // Purge CSS
        let contentPaths = [];

        if (Array.isArray(api.config.purgeCss.paths)) {
            api.config.purgeCss.paths.forEach((pattern) => {
                contentPaths = [
                    ...glob.sync(pattern, { nodir: true }),
                    ...contentPaths,
                ];
            });
        } else {
            contentPaths = [
                ...glob.sync(api.config.purgeCss.paths, { nodir: true })
            ];
        }

        config.plugin('purge-css')
            .use(PurgecssPlugin, [{
                paths: contentPaths,
            }])
            .end();

        resolve();
    });
});
