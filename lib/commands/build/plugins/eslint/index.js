/* eslint import/newline-after-import: 0 */
/* eslint import/no-extraneous-dependencies: 0 */
/* eslint import/order: 0 */
/* eslint indent: 0 */

const path = require('path');

module.exports = api => new Promise((resolve) => {
    api.chainWebpack((config) => {
        // Lint JS/Vue files
        config.module
            .rule('lint')
            .pre()
            .test(/\.(vue|(j|t)sx?)$/)
            .exclude
                .add(/node_modules/)
                .end()
            .include
                .add(api.paths.scripts)
                .add(api.paths.components)
                .end()
            .use('eslint')
                .loader('eslint-loader')
                .options({
                    configFile: path.resolve(__dirname, '.eslintrc.js'),
                })
                .end();

            resolve();
    });
});
