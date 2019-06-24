const modifyConfig = (config, fn) => {
    if (Array.isArray(config)) {
        config.forEach(c => fn(c));
    } else {
        fn(config);
    }
}

async function prebuild(args, api, options) {
    const fs = require('fs');
    const path = require('path');

    /**
     * Build the breakpoint
     *
     * @param {String} breakpoint
     * @param {Number} count
     */
    const buildBreakpoint = (breakpoint, count) => `@include ${breakpoint} { html { font-family: '${count}'; } }\n`;

    /**
     * Create a mixin based on the provided breakpoint information
     *
     * @param {String} breakpoint
     * @param {Number} condition
     */
    const buildMixin = (breakpoint, condition) => `@mixin ${breakpoint}() { @media (min-width: ${condition}px) { @content; } }\n`;

    /**
     * Create the responsive.scss file required for $screen
     * to work properly
     *
     * @param {*} breakpoints
     */
    const createResponsiveFiles = (breakpoints) => {
        let count = 2;
        const tempPath = path.resolve(api.service.paths.weeCore, 'styles/temp');
        const result = {
            responsive: '/* stylelint-disable */\n\n',
            mixins: '/* stylelint-disable */\n\n',
        };

        Object.keys(breakpoints).forEach((breakpoint) => {
            result.responsive += buildBreakpoint(breakpoint, count);
            result.mixins += buildMixin(breakpoint, breakpoints[breakpoint]);
            count++;
        });

        if (! fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath);
        }

        fs.writeFileSync(path.resolve(tempPath, 'responsive.scss'), result.responsive, 'utf-8');
        fs.writeFileSync(path.resolve(tempPath, 'mixins.scss'), result.mixins, 'utf-8');
    };

    // Create temp responsive.scss file
    createResponsiveFiles(options.style.breakpoints);
}

async function build(args, api, options) {
    const webpack = require('webpack');
    const fs = require('fs-extra');
    const path = require('path');
    const chalk = require('chalk');
    const { log, done } = require('../../../utils/log');
    const { logWithSpinner, stopSpinner } = require('../../../utils/spinner');
    const formatStats = require('./formatStats');
    const targetDir = api.resolve(args.dest || path.join(options.paths.root, options.paths.assets));

    log();
    const mode = api.service.mode;
    logWithSpinner(`Building for ${api.service.staging ? 'staging' : mode}...`);

    let webpackConfig = api.resolveWebpackConfig();

    if (args.watch) {
        modifyConfig(webpackConfig, config => {
            config.watch = true;
        });
    }

    if (args.report || options.analyze) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

        modifyConfig(webpackConfig, config => {
            const bundleName = args.target !== 'app'
                ? config.output.filename.replace(/\.js$/, '-')
                : isLegacyBuild ? 'legacy-' : '';

            config.plugins.push(new BundleAnalyzerPlugin({
                logLevel: 'warn',
                openAnalyzer: true,
                analyzerMode: args.report ? 'static' : 'disabled',
                reportFilename: `${bundleName}report.html`,
                statsFilename: `${bundleName}report.json`,
                generateStatsFile: !!args['report-json']
            }));
        });
      }

    return new Promise((resolve, reject) => {
        // Delete contents of output directory
        Object.keys(api.service.paths.output).forEach(key => {
            fs.removeSync(api.service.paths.output[key]);
        });

        webpack(webpackConfig, (err, stats) => {
            stopSpinner(false);

            if (err) {
                return reject(err);
            }

            if (stats.hasErrors()) {
                const jsonStats = stats.toJson();
                let errors = '';

                if (Array.isArray(jsonStats.errors)) {
                    errors = jsonStats.errors.join('\n\n');
                } else {
                    errors = jsonStats.errors;
                }

                return reject([`Build failed with errors.`, errors]);
            }

            const targetDirShort = path.relative(
                api.service.context,
                targetDir,
            );

            done(chalk.green(`Compiled successfully in ${stats.endTime - stats.startTime}ms\n\n`));
            log(formatStats(stats, targetDirShort, api));

            if (api.service.mode === 'production') {
                done(`Build complete.\n`);
            }

            // if (args.target === 'app' && !isLegacyBuild) {
            //     if (!args.watch) {
            //     done(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.\n`)
            // } else {
            //     done(`Build complete. Watching for changes...`)
            // }

            resolve();
        });
    });
}

module.exports = (api, options) => {
    api.registerCommand('build', {
        usage: 'wee build [options]',
        options: {
            '--report': 'generate report.html to help analyze bundle content',
            '--mode': 'specify env mode (default: production)',
        },
    }, async (args) => {
        await prebuild(args, api, options);
        await build(args, api, options);
    });
};
