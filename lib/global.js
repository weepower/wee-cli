const createService = require('./service/createService');

exports.build = (mode, args = {}) => {
    process.env.WEE_CLI_MODE = mode;

    const context = process.cwd();

    createService(context).run('build', args);
}
