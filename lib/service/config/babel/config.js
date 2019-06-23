module.exports = (api) => {
    const { browserslist } = require(api.resolve('package.json'));

    return {
        presets: [
            [
                '@babel/env', {
                    targets: browserslist,
                },
            ],
        ],
        plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-syntax-dynamic-import',
            'minify-dead-code-elimination',
            'minify-mangle-names',
        ],
    };
}
