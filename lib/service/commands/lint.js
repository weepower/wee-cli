const { CLIEngine } = require('eslint');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { error, log, done } = require('../../../lib/utils/log');

module.exports = (api, options) => {
    api.registerCommand('lint', async (args) => {
        const cwd = api.resolve('.');
        const paths = api.service.resolvePaths();
        const configPath = path.join(paths.project, '.eslintrc.js');

        if (! fs.existsSync(configPath)) {
            return error('Missing eslint configuration file.');
        }

        const config = require(configPath);

        config.fix = !! args.fix;

        const engine = new CLIEngine(config);

        const report = engine.executeOnFiles([
            `${paths.components}/**/*.{js,vue}`,
            `${paths.scripts}/**/*.js`,
        ])

        if (config.fix) {
            CLIEngine.outputFixes(report);
        }

        const hasFixed = report.results.some(f => f.output);
        const formatter = engine.getFormatter('codeframe');

        if (hasFixed) {
            log(`The following files have been auto-fixed:`);
            log();

            report.results.forEach(f => {
                if (f.output) {
                    log(`  ${chalk.blue(path.relative(cwd, f.filePath))}`);
                }
            });
        }

        log();

        if (report.warningCount || report.errorCount) {
            log(formatter(report.results));
        } else {
            done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`);
        }
    });
};
