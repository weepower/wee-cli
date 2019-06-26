#! /usr/bin/env node

const commander = require('commander');
const program = new commander.Command();
const chalk = require('chalk');
const glob = require('glob');
const { error, log } = require('../lib/utils/log');
const Service = require('../lib/service/Service');

const service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd());

program
    .command('build')
    .description('build for specified environment')
    .option('-r, --report', 'Open webpack bundle analyzer in a browser')
    .option('-m, --mode [mode]', 'The environment to build for', 'production')
    .action((options) => {
        service.run('build', options).catch((err) => {
            log();
            log(err);
            process.exit(1);
        });
    });

program
    .command('serve')
    .description('start development server and watch files for changes')
    .option('-m, --mode [mode]', 'The environment for which to build', 'development')
    .action((options) => {
        service.pushPlugin('./config/browser-sync');
        service.run('serve', options).catch((err) => {
            log(err);
        });
    });

program
    .command('make:component <name>')
    .description('make a component')
    .option('-v, --vue', 'create vue component')
    .option('-s, --scss', 'create style only component')
    .option('-r, --root', 'vue only - configure as root component (mounted to page)')
    .option('-c, --clean', 'strip out bootstrapping code from generated files')
    .action((name, options) => {
        const service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd());

        options.name = name;

        service.run('make:component', options).catch((err) => {
            error(err);
            process.exit(1);
        });
    });

program
    .command('make:command <name>')
    .description('make a component')
    .action((name, options) => {
        const service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd());

        options.name = name;

        service.run('make:command', options).catch((err) => {
            error(err);
            process.exit(1);
        });
    });

function registerUsercommands() {
    const service = new Service(process.env.WEE_CLI_CONTEXT || process.cwd());
    service.init();

    const userCommands = glob.sync(`${service.paths.commands}/**/*.js`);

    userCommands.forEach((command) => {
        require(command)(program);
    });
}

registerUsercommands();

// Output help if no command was executed
if (! process.argv.slice(2).length) {
    program.outputHelp();
}

program.on('command:*', () => {
    error(`Invalid command: ${chalk.bold(program.args.join(' '))}`);
    log('See --help for a list of available commands.');
    process.exit(1);
});

// lol
program.on('command:party', () => {
    const request = require('request');

    request
        .get('http://parrot.live')
        .on('response', (response) => {
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                console.log(chunk);
            });

            setTimeout(() => {
                log();
                log('Okay, party\'s over...');
                process.exit(1);
            }, 20000);
        });
});

program.parse(process.argv);
