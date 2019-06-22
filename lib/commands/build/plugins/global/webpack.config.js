const glob = require('glob');
const path = require('path');
const Api = require('../../Api');

const api = new Api();

module.exports = api => api.resolveChainableConfigs().toConfig();
