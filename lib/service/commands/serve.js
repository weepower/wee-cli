module.exports = (api, options) => {
    api.registerCommand('serve', {
        usage: 'wee serve [options]',
        options: {
            '--open': `open browser on server start`,
            '--copy': `copy url to clipboard on server start`,
            '--mode': `specify env mode (default: development)`,
        },
    }, async (args) => {
        const webpack = require('webpack');
        const { info } = require('../../utils/log');

        let webpackConfig = api.resolveChainableWebpackConfig().toConfig();

        info('Starting development server...\n\n');

        return new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                if (stats.hasErrors()) {
                    const jsonStats = stats.toJson();
                    let errors = '';

                    if (stats.children && stats.children.length) {
                        stats.children.forEach(child => {
                            console.log(child.errors);
                        });
                    }

                    if (Array.isArray(jsonStats.errors)) {
                        errors = jsonStats.errors.join('\n\n');
                    } else {
                        errors = jsonStats.errors;
                    }

                    return reject([`Build failed with errors.`, errors]);
                }

                // const targetDirShort = path.relative(
                //     api.service.context,
                //     targetDir,
                // );

                // done(chalk.green(`Compiled successfully in ${stats.endTime - stats.startTime}ms\n\n`));
                // log(formatStats(stats, targetDirShort, api));

                // if (api.service.mode === 'production') {
                //     done(`Build complete.\n`);
                // }

                resolve();
            });
        });
    });
};
