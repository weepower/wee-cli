const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const paths = require('./lib/config/paths');
const { log } = require('../../../lib/utils');

function formatStats(stats) {
    const fs = require('fs');
    const path = require('path');
    const zlib = require('zlib');
    const chalk = require('chalk');
    const ui = require('cliui')({ width: 80 });
    const dir = paths.assets;

    const json = stats.toJson({
        hash: false,
        modules: false,
        chunks: false
    });

    let assets = json.assets
        ? json.assets
        : json.children.reduce((acc, child) => acc.concat(child.assets), []);

    const seenNames = new Map();
    const isJS = val => /\.js$/.test(val);
    const isCSS = val => /\.css$/.test(val);
    const isMinJS = val => /\.min\.js$/.test(val);

    assets = assets
        .filter(a => {
            if (seenNames.has(a.name)) {
                return false;
            }
            seenNames.set(a.name, true);

            return isJS(a.name) || isCSS(a.name);
        })
        .sort((a, b) => {
            if (isJS(a.name) && isCSS(b.name)) return -1;
            if (isCSS(a.name) && isJS(b.name)) return 1;
            if (isMinJS(a.name) && !isMinJS(b.name)) return -1;
            if (!isMinJS(a.name) && isMinJS(b.name)) return 1;

            return b.size - a.size;
        });

    function formatSize(size) {
        return (size / 1024).toFixed(2) + ' kb'
    }

    function getGzippedSize (asset) {
        const subDir = /js$/.test(asset.name) ? 'scripts' : 'styles';
        const filepath = path.resolve(path.join(dir, subDir, asset.name));
        const buffer = fs.readFileSync(filepath);

        return formatSize(zlib.gzipSync(buffer).length);
    }

    function makeRow(a, b, c) {
        return `  ${a}\t    ${b}\t ${c}`
    }

    ui.div(
        makeRow(
            chalk.cyan.bold(`File`),
            chalk.cyan.bold(`Size`),
            chalk.cyan.bold(`Gzipped`)
        ) + `\n\n` +
        assets.map(asset => makeRow(
            /js$/.test(asset.name)
                ? chalk.green(path.join(`/scripts/${asset.name}`))
                : chalk.blue(path.join(`/styles/${asset.name}`)),
            formatSize(asset.size),
            getGzippedSize(asset)
        )).join(`\n`)
    );

    return `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of assets omitted.`)}\n`
}


module.exports = (program) => {
    const envs = ['development', 'staging', 'production'];

    const { args } = program;
    let env = 'development';

    // Check to make sure the enviroment is valid
    if (args.length && args[0].length) {
        const arg = args[0];

        if (envs.includes(arg)) {
            env = arg;
        } else {
            log.error(`Invalid environment. Valid environments include: ${envs.join(', ')}`);

            return;
        }
    }

    const configPath = path.resolve(process.cwd(), 'wee.config.js');

    if (! fs.existsSync(configPath)) {
        log.error('wee.config.js not found');

        return;
    }

    const config = require(configPath);

    log.withSpinner('Prebuild');

    require('./lib/config/prebuild')().then(() => {
        log.withSpinner.stop();
    }).catch((error) => {
        log.withSpinner.stop(false);
        log.withSpinner(chalk.red('✖'), 'Error');
        log.withSpinner.stop();
        log.error(error);
    });

    webpack(require('./lib/config/webpack.dev.config.js'), (err, stats) => {
        log(formatStats(stats));
    });
}
