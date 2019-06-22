const SuppressChunksPlugin = require('suppress-chunks-webpack-plugin').default;

module.exports = api => new Promise((resolve, reject) => {
    api.chainWebpack(config => {
        // Don't generate js chunks for css only entry points
        config.plugin('suppress-chunks')
            .use(SuppressChunksPlugin, [
                ...Object.keys(api.config.style.entry).map(name => ({ name, match: /\.(js|js.map)$/ })),
            ]);
        resolve();
    });
});
