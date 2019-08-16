const defaultsDeep = require('lodash.defaultsdeep');
​
module.exports = (api, options) => {
    api.chainWebpack(config => {
        const isProd = process.env.NODE_ENV === 'production';
​
        config.output.pathinfo(true);
​
        if (api.optionEnabled(options.manifest)) {
            const manifestName = options.manifest.fileName ?
                options.manifest.fileName : 'assets.json';
​
            config.plugin('manifest')
                .use(require('webpack-manifest-plugin'), [defaultsDeep({
                    publicPath: '',
                    fileName: `../../${manifestName}`,
                    map: (file) => {
                        file.path = file.path.replace('../styles/', '');
​
                        return file;
                    },
                    // Filter out anything that isn't css, js or source map
                    filter: (file) => {
                        const entries = options.style.entry;
                        const styleEntries = [];
​
                        // While we are suppresing the js file created by webpack
                        // for the CSS only entry points, the manifest still includes
                        // them so we must filter them out.
                        Object.keys(entries).forEach((entry) => {
                            styleEntries.push(...[
                                entries[entry].replace('css', 'js'),
                                entries[entry].replace('css', 'js.map'),
                            ]);
                        });
​
                        return /\.(css|js|map)$/gi.test(file.name)
                            && ! styleEntries.includes(file.name);
                    },
            }, options.manifest)]);
        }
​
        // code splitting
        if (isProd && api.optionEnabled(options.chunking)) {
            config
                .optimization.splitChunks(defaultsDeep({
                    cacheGroups: {
                        vendors: {
                            name: 'chunk-vendors',
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            chunks: 'initial'
                        },
                        common: {
                            name: 'chunk-common',
                            minChunks: 2,
                            priority: -20,
                            chunks: 'initial',
                            reuseExistingChunk: true
                        },
                    },
                }, (typeof options.chunking === 'object' ? options.chunking : {}) || {}));
        }
​
        // Do not generate js chunks from css only entries
        config.plugin('suppress-chunks')
            .use(
                require('suppress-chunks-webpack-plugin').default,
                [Object.keys(options.style.entry).map(name => ({ name, match: /\.(js|js.map)$/ }))]
            )
            .end();
​
        config.plugin('friendly-errors')
            .use(require('friendly-errors-webpack-plugin'))
            .end();
    });
}
