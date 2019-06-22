const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        config.plugin('manifest')
            .use(ManifestPlugin, [{
                publicPath: '',
                fileName: `../../${api.config.manifest.options.filename}`,
                map: (file) => {
                    file.path = file.path.replace('../styles/', '');
                    return file;
                },
                // Filter out anything that isn't css, js or source map
                filter: (file) => {
                    const entries = api.config.style.entry;
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

        resolve();
    });
});
