const { build, prebuild } = require('../../../utils/build');

module.exports = (api, options) => {
    api.registerCommand('build', async (args) => {
        await prebuild(args, api, options);
        await build(args, api, options);
    });
};
