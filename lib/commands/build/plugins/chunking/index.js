const NamedChunksWebpackPlugin = require('webpack/lib/NamedChunksPlugin');

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        const cacheGroups = {};

        if (api.config.chunking.vendor.enabled) {
            cacheGroups.vendors = {
                test: /[\\/]node_modules[\\/].+\.js$/,
                priority: -10,
                chunks: 'initial',
                ...api.config.chunking.vendor.options,
            };
        }

        if (Object.keys(cacheGroups).length) {
            config.optimization.splitChunks({ cacheGroups });
        }

        // keep chunk ids stable so async chunks have consistent hash (#1916)
        const seen = new Set();
        const nameLength = 4;

        config.plugin('named-chunks')
            .use(NamedChunksWebpackPlugin, [(chunk) => {
                if (chunk.name) {
                    return chunk.name;
                }

                const modules = Array.from(chunk.modulesIterable);

                if (modules.length > 1) {
                    const joinedHash = hash(modules.map(m => m.id).join('_'));
                    let len = nameLength;

                    while (seen.has(joinedHash.substr(0, len))) len++;

                    seen.add(joinedHash.substr(0, len));

                    return `chunk-${joinedHash.substr(0, len)}`;
                }

                return modules[0].id;
            }]);

        resolve();
    });
});
