const glob = require('glob');

module.exports = (api, options) => {
    api.chainWebpack(config => {
        if (api.optionEnabled(options.purgeCss)) {
            let contentPaths = [];

            if (Array.isArray(options.purgeCss.paths)) {
                options.purgeCss.paths.forEach((pattern) => {
                    contentPaths = [
                        ...contentPaths,
                        ...glob.sync(pattern, { nodir: true }),
                    ];
                });
            } else {
                contentPaths = [
                    ...glob.sync(options.purgeCss.paths, { nodir: true })
                ];
            }

            if (contentPaths.length) {
                options.purgeCss.paths = contentPaths;

                config.plugin('purge-css')
                    .use(require('purgecss-webpack-plugin'), [options.purgeCss])
                    .end();
            }
        }
    });
}
