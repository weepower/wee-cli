let service = process.WEE_CLI_SERVICE

if (! service) {
    const Service = require('../../Service');
    service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd())
    service.init(process.env.NODE_ENV)
}

module.exports = service.resolveWebpackConfig();
