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

        resolve();
    });
});
