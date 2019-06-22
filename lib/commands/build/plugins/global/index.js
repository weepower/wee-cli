const path = require('path');

module.exports = (api) => {
    return new Promise((resolve, reject) => {
        api.chainWebpack(config => {
            config.resolve
                .modules
                    .add(path.join(api.paths.weeCore, 'scripts'))
                    .add(api.paths.nodeModules);

            resolve();
        });
    });
}
