#! /usr/bin/env node

/* global require, process */

const program = require('commander');
const fs = require('fs');
const cwd = process.cwd();
const cliPath = `${cwd}/node_modules/wee-core/cli.js`;
const command = process.argv[2];

// Register version and init command
program
    .version(require('../package').version)
    .usage('[command] [options]');

// Register commands in wee-core and project specific commands
// These commands must be called from within a proper wee project to work
fs.stat(cliPath, function(error) {
    if (error) {
        // Process early and stop if no command, or help command called
        // and we are not inside of a proper project
        if (! command || command === '-h' || command === '--help' || command === '-V' || command === '--version') {
            program.command('init', 'create a new project');

            program.parse(process.argv);
            return;
        }

        fs.stat('./package.json', function(error) {
            if (error) {
                console.log('Wee package.json not found in current directory');
                return;
            }

            fs.readFile('./package.json', function(error, data) {
                if (error) {
                    console.log(error);
                    return;
                }

                // Check for valid Wee installation
                var config = JSON.parse(data);

                if (config.name == 'wee-framework' || config.name == 'wee') {
                    console.log('Run "npm install" to install Wee core');
                } else {
                    console.log('The package.json is not compatible with Wee');
                }
            });
        });

        return;
    }

    // Set help as default command if nothing found
    program
        .on('*', () => {
            program.outputHelp();
        });

    // Register all other commands from specific project
    require(cliPath)(cwd, program);

    // Process cli input and execute command
    program.parse(process.argv);
});
