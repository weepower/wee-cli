const glob = require('glob');

module.exports = (api, options) => {
    api.chainWebpack(config => {
        if (api.optionEnabled(options.purgeCss)) {
            let contentPaths = [];

            if (Array.isArray(options.purgeCss.paths)) {
                options.purgeCss.paths.forEach((pattern) => {
                    contentPaths = [
                        ...glob.sync(pattern, { nodir: true }),
                        ...contentPaths,
                    ];
                });
            } else {
                contentPaths = [
                    ...glob.sync(options.purgeCss.paths, { nodir: true })
                ];
            }

            options.purgeCss.paths = contentPaths;

            config.plugin('purge-css')
                .use(require('purgecss-webpack-plugin'), [options.purgeCss])
                .end();
        }
    });
}
