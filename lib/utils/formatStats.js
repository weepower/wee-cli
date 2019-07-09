/*
* The MIT License (MIT)
*
* Copyright (c) 2017-present, Yuxi (Evan) You
*/

module.exports = function formatStats(stats, dir, api) {
    const fs = require('fs');
    const path = require('path');
    const zlib = require('zlib');
    const chalk = require('chalk');
    const ui = require('cliui')({ width: 100 });

    const json = stats.toJson({
        hash: false,
        modules: false,
        chunks: false
    });

    let assets = json.assets
        ? json.assets
        : json.children.reduce((acc, child) => acc.concat(child.assets), []);

    json.children.forEach(child => {
        if (child.errors.length) {
            child.errors.forEach(error => {
                console.log(error);
            });
        }
    });

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

    function humanFileSize(size) {
        const i = Math.floor(Math.log(size) / Math.log(1024));

        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' '  + ['b', 'kb', 'mb'][i];
    };

    let totalSize = 0;
    let totalGzipSize = 0;

    function formatSize(size) {
        const calculated = (size / 1024).toFixed(2);
        let color = 'green';
        let humanSize = humanFileSize(size);

        if (parseInt(calculated) > 244 && parseInt(calculated) < 350) {
            color = 'yellow';
        }

        if (parseInt(calculated) > 350) {
            color = 'red';
            humanSize = chalk.bold(humanSize);
        }

        totalSize += size;

        return chalk[color](humanSize);
    }

    function getGzippedSize(asset) {
        const type = isJS(asset.name) ? 'scripts' : 'styles';
        const filepath = api.resolve(path.join(dir, type, asset.name));
        const buffer = fs.readFileSync(filepath);
        const size = zlib.gzipSync(buffer).length;

        totalGzipSize += size;

        return formatSize(size);
    }

    function makeRow(a, b, c) {
        return `  ${a}\t    ${b}\t ${c}`;
    }

    ui.div(
        makeRow(
            chalk.cyan.bold(`File`),
            chalk.cyan.bold(`Size`),
            chalk.cyan.bold(`Gzipped`)
        ) + `\n\n` +
            assets.map((asset) => makeRow(
                /js$/.test(asset.name)
                    ? chalk.green(path.join(dir, 'scripts', asset.name))
                    : chalk.blue(path.join(dir, asset.name.replace('../', ''))),
            formatSize(asset.size),
            getGzippedSize(asset)
        )).join(`\n`) + `\n\n\n` +
        makeRow(
            chalk.bold('Total Size:'),
            formatSize(totalSize),
            formatSize(totalGzipSize)
        )
    );

    return `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of assets omitted.`)}\n`;
  }
