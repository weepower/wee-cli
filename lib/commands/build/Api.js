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
        images: path.resolve(source, 'images'),
        fonts: path.resolve(source, 'fonts'),
        output: {
            styles: path.resolve(assets, 'styles'),
            scripts: path.resolve(assets, 'scripts'),
            images: path.resolve(assets, 'images'),
            fonts: path.resolve(assets, 'fonts'),
        },
    }
}

class Api {
    constructor(configMode = false) {
        // Set required paths
        this.paths = setPaths();

        this.configMode = configMode;
        this.config = weeConfig;
        this.plugins = {
            entries: {
                name: 'Entries',
                fn: undefined,
            },
            clean: {
                name: 'Clean',
                fn: undefined,
            },
            copy: {
                name: 'Copy',
                fn: undefined,
            },
            babel: {
                name: 'Babel',
                fn: undefined,
            },
            eslint: {
                name: 'ESLint',
                fn: undefined,
            },
            scss: {
                name: 'Scss',
                fn: undefined,
            },
            suppress: {
                name: 'Suppress',
                fn: undefined,
            },
            global: {
                name: 'Global',
                fn: undefined,
            },
        };

        if (this.configMode) {
            this.plugins.prebuild = undefined;
        }

        if (this.config.chunking.vendor.enabled) {
            this.plugins.chunking = {
                name: 'Chunking',
                fn: undefined,
            };
        }

        if (this.config.manifest.enabled) {
            this.plugins.manifest = {
                name: 'Manifest',
                fn: undefined,
            };
        }

        if (this.config.purgeCss.enabled) {
            this.plugins.purgecss = {
                name: 'Purgecss',
                fn: undefined,
            };
        }

        this.webpackChainFns = [];
        this.env = null;

        this.ensureConfig();
    }

    setEnv(env) {
        this.env = env;
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
            const key = path.basename(path.dirname(filePath));
            const plugin = this.plugins[key];

            if (plugin) {
                plugin.fn = require(filePath)(this);
            }
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
