#! /usr/bin/env node

const { error, log } = require('../lib/utils/log');
const Service = require('../lib/service/Service');

const rawArgv = process.argv.slice(2);
const args = require('minimist')(rawArgv, {
    string: [
        // component
        'name',
    ],
    boolean: [
        // component
        'vue',
        'root',
        'empty',
        // build
        'noexit',
        'silent',
        'modern',
        'report',
        'report-json',
        'watch',
    ],
});
const command = args._[0];
const options = {};

// Set required plugins and config for the serve command
if (command === 'serve') {
    options.plugins = [
        './config/browser-sync'
    ];

    args.mode = 'development'
}

const service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd(), options);

service.run(command, args, rawArgv).catch(err => {
    if (! args.silent) {
        if (command === 'build') {
            error('Build failed with errors:\n');
        }

        if (err && err.stack) {
            log(err.stack);
        } else if (err) {
            log(err);
        }

        if (command !== 'serve' && ! args.noexit) {
            process.exit(1);
        }
    }
});

// init - new project
// component - new component
// build - build - local, staging, production
// lint

