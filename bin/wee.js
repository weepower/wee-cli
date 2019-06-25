#! /usr/bin/env node

const commander = require('commander');
const program = new commander.Command();
const { error, log } = require('../lib/utils/log');

program.version(require('../package').version);

const Service = require('../lib/service/Service');

const rawArgv = process.argv.slice(2);
const args = require('minimist')(rawArgv, {
    boolean: [
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
        error('Build failed with errors:\n');
        if (err.stack) {
            log(err.stack);
        } else {
            log(err);
        }

        if (command !== 'serve' && ! args.noexit) {
            process.exit(1);
        }
    }
    // console.log(err);
    // if (command !== 'serve') {
    //     let message = err;
    //     let errors = null;

    //     if (Array.isArray(err)) {
    //         message = err[0];
    //         errors = err[1];
    //     }

    //     log();
    //     error(message);

    //     if (errors && errors.length) {
    //         log();
    //         log(errors);
    //     }

    //     process.exit(1);
    // }
});

program.parse(process.argv);

if (! process.argv.slice(2).length) {
    program.outputHelp();
}

// init - new project
// component - new component
// build - build - local, staging, production
// lint

