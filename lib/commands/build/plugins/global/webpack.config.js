const glob = require('glob');
const path = require('path');
const Api = require('../../Api');

const api = new Api(true);

api.addPlugins(glob.sync(path.resolve(__dirname, '../../plugins/*/index.js')));

module.exports = api.resolveChainableConfigs().toConfig();
