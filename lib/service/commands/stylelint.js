const stylelint = require('stylelint');
const path = require('path');
const { log, done, error } = require('../../utils/log');

module.exports = (api, options) => {
    api.registerCommand('stylelint', async (args) => {
        const paths = api.service.resolvePaths();
        const configFile = path.join(paths.project, '.stylelintrc.js');

        stylelint.lint({
            configFile,
            formatter: require('stylelint-codeframe-formatter'),
            fix: !! args.fix,
            files: [
                `${paths.components}/**/*.{scss,css}`,
                `${paths.styles}/**/*.{scss,css}`,
            ]
        }).then((results) => {
            const hasErrors = results.errored;

            if (hasErrors && results.output) {
                log(results.output);
                error('Some errors potentially fixable with the `--fix` option.');
                process.exit(1);
            } else {
                done('No lint errors found!');
            }
        }).catch((err) => {
            error(err);
        });
    });
};
