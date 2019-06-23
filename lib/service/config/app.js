module.exports = (api, options) => {
    api.chainWebpack(config => {
        const isProd = process.env.NODE_ENV === 'production';

        if (options.manifest.enabled) {
            config.plugin('manifest')
                .use(require('webpack-manifest-plugin'), [{
                    publicPath: '',
                    fileName: `../../${options.manifest.options.filename}`,
                    map: (file) => {
                        file.path = file.path.replace('../styles/', '');

                        return file;
                    },
                    // Filter out anything that isn't css, js or source map
                    filter: (file) => {
                        const entries = options.style.entry;
                        const styleEntries = [];

                        // While we are suppresing the js file created by webpack
                        // for the CSS only entry points, the manifest still includes
                        // them so we must filter them out.
                        Object.keys(entries).forEach((entry) => {
                            styleEntries.push(...[
                                entries[entry].replace('css', 'js'),
                                entries[entry].replace('css', 'js.map'),
                            ]);
                        });

                        return /\.(css|js|map)$/gi.test(file.name)
                            && ! styleEntries.includes(file.name);
                    },
            }]);
        }

        // code splitting
        if (isProd) {
            const userChunks = Object.keys(options.chunking);
            const cacheGroups = {
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
            };

            // Merge in user chunks
            if (userChunks.length) {
                userChunks.forEach(chunk => {
                    console.log(chunk, options.chunking[chunk]);
                    // cacheGroups[chunk] = options.chunking[chunk];
                });
            }

            // Default chunking
            config
                .optimization.splitChunks({
                    cacheGroups,
                });
            }
    });
}
