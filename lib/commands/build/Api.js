const path = require('path');
const fs = require('fs');
const Config = require('webpack-chain');
const { log } = require('../../utils');

const cwd = process.cwd();
const weeConfigPath = path.resolve(cwd, 'wee.config.js');

// Check for existance of wee.config.js
if (! fs.existsSync(weeConfigPath)) {
    log.error('wee.config.js not found');

    return;
}

const weeConfig = require(weeConfigPath);

function setPaths() {
    const project = path.resolve(cwd);
    const source = path.resolve(project, weeConfig.paths.source);
    const root = path.resolve(project, weeConfig.paths.root);
    const assets = path.resolve(root, weeConfig.paths.assets);
    const nodeModules = path.resolve(project, 'node_modules');

    return {
        root,
        source,
        assets,
        config: weeConfigPath,
        temp: path.resolve(cwd, 'temp'),
        project: {
            basepath: path.resolve(cwd),
        },
        nodeModules,
        weeCore: path.resolve(nodeModules, 'wee-core'),
        packageJson: path.resolve(cwd, 'package.json'),
        styles: path.resolve(source, 'styles'),
        scripts: path.resolve(source, 'scripts'),
        components: path.resolve(source, 'components'),
        output: {
            styles: path.resolve(assets, 'styles'),
            scripts: path.resolve(assets, 'scripts'),
            images: path.resolve(assets, 'images'),
            fonts: path.resolve(assets, 'fonts'),
        },
    }
}

class Api {
    constructor() {
        // Set required paths
        this.paths = setPaths();

        this.config = weeConfig;
        this.plugins = {
            prebuild: undefined,
            entries: undefined,
            scss: undefined,
            global: undefined,
        };
        this.webpackChainFns = [];

        this.ensureConfig();
    }

    ensureConfig() {
        // Config files
        const packageJson = require(this.paths.packageJson);

        // Update package.json
        if (! packageJson.config) {
            packageJson.config = {};
        }

        // Update config properties in package.json to be used by npm scripts
        packageJson.config.root = this.config.paths.root;
        packageJson.config.source = this.config.paths.source;
        packageJson.config.build = this.config.paths.build;

        fs.writeFileSync(this.paths.packageJson, JSON.stringify(packageJson, null, 2));
    }

    chainWebpack(fn) {
        this.webpackChainFns.push(fn);
    }

    addPlugins(paths) {
        paths.forEach(filePath => {
            const plugin = path.basename(path.dirname(filePath));
            this.plugins[plugin] = require(filePath)(this);
        });
    }

    resolveChainableConfigs() {
        const config = new Config();
        this.webpackChainFns.forEach(fn => fn(config));

        return config;
    }

    resolveWebpackConfig() {
        return this.resolveChainableConfigs().toConfig();
    }
}

module.exports = Api;
