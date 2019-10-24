const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const defaultsDeep = require('lodash.defaultsdeep');
const Config = require('webpack-chain');
const readPkg = require('read-pkg');
const merge = require('webpack-merge');
const PluginAPI = require('./PluginAPI');
const { error } = require('../utils/log');
const { validate, defaults } = require('../options');

module.exports = class Service {
    constructor (context, { plugins, useBuiltIn } = {}) {
        process.WEE_CLI_SERVICE = this;
        this.initialized = false;
        this.context = context;
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];
        this.commands = {};
        this.pkg = this.resolvePkg();

        this.plugins = this.resolvePlugins(plugins, useBuiltIn);
    }

    init(mode = process.env.WEE_CLI_MODE) {
        if (this.initialized) {
            return;
        }

        this.staging = false;

        if (! mode) {
            mode = 'production';
        }

        if (mode === 'staging') {
            mode = 'development';
            this.staging = true;
        }

        this.mode = mode;
        process.env.NODE_ENV = mode;

        this.initialized = true;

        const userOptions = this.loadUserOptions();

        this.projectOptions = defaultsDeep(userOptions, defaults());
        this.paths = this.resolvePaths();

        // apply webpack configs from project config file
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack)
        }

        if (this.projectOptions.configureWebpack) {
            this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
        }

        this.plugins.forEach(({ id, apply }) => {
            apply(new PluginAPI(id, this), this.projectOptions)
        });
    }

    resolvePkg() {
         if (fs.existsSync(path.join(this.context, 'package.json'))) {
            return readPkg.sync(this.context);
        } else {
            return {}
        }
    }

    resolvePaths() {
        const project = path.resolve(this.context);
        const source = path.resolve(project, this.projectOptions.paths.source);
        const root = path.resolve(project, this.projectOptions.paths.root);
        const assets = path.resolve(root, this.projectOptions.paths.assets);
        const nodeModules = path.resolve(project, 'node_modules');

        return {
            project,
            source,
            root,
            assets,
            nodeModules,
            commands: path.resolve(source, 'commands'),
            temp: path.resolve(__dirname, '../../temp'),
            weeCore: path.resolve(nodeModules, '@weepower', 'core'),
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

    pushPlugin(plugin) {
        const idToPlugin = id => ({
            id: id.replace(/^.\//, ''),
            apply: require(id),
        });

        this.plugins.push(idToPlugin(plugin));
    }

    resolvePlugins(plugins) {
        const idToPlugin = id => ({
            id: id.replace(/^.\//, ''),
            apply: require(id),
        });

        let builtInPlugins = [
            // Commands
            './commands/build',
            './commands/serve',
            './commands/make',
            './commands/reset',
            './commands/lint',

            // Config
            './config/base',
            './config/babel',
            './config/eslint',
            './config/css',
            './config/dev',
            './config/copy',
            './config/purgecss',
            './config/stylelint',
            './config/app',
            './config/prod',
        ];

        if (plugins) {
            builtInPlugins = builtInPlugins.concat(plugins);
        }

        return builtInPlugins.map(idToPlugin);
    }

    loadUserOptions() {
        let fileConfig;

        const configPath = (
            process.env.WEE_CLI_SERVICE_CONFIG_PATH ||
            path.resolve(this.context, 'wee.config.js')
        );

        if (fs.existsSync(configPath)) {
            try {
                fileConfig = require(configPath);

                if (! fileConfig || typeof fileConfig !== 'object') {
                    error(`Error loading ${chalk.bold('wee.config.js')}: should export an object.`);

                    fileConfig = null;
                }
            } catch (e) {
                error(`Error loading ${chalk.bold('vue.config.js')}:`);

                throw e;
            }
        }

        // validate options
        validate(fileConfig, msg => {
            error(`Invalid options in wee.config.js: ${msg}`);
        });

        return fileConfig;
    }

    resolveChainableWebpackConfig () {
        const chainableConfig = new Config();

        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));

        return chainableConfig;
    }

    async run(name, args = {}) {
        const mode = args.mode;

        this.init(mode);

        let command = this.commands[name];

        if (! command) {
            error('Command not found!');
            process.exit(1);
        }

        return command(args);
    }



    resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
        if (! this.initialized) {
            throw new Error('Service must call init() before calling resolveWebpackConfig().');
        }

        // get raw config
        let config = chainableConfig.toConfig();

        // apply raw config fns
        this.webpackRawConfigFns.forEach(fn => {
            if (typeof fn === 'function') {
                // function with optional return value
                const res = fn(config);

                if (res) {
                    config = merge(config, res);
                } else if (fn) {
                    // merge literal values
                    config = merge(config, fn);
                }
            }
        });

        return config;
    }
}
