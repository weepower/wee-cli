#! /usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const program = new commander.Command();

program.version(require('../package').version);

program
    .command('build [env]', 'Build for the specified environment: development (default), staging, production');


// program
//     .command('build <env>')
//     .action((env) => {

//     });

program.parse(process.argv)

// init - new project
// component - new component
// build - build - local, staging, production
// lint

