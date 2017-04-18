#! /usr/bin/env node

/* global require, process */

var program = require('commander'),
	fs = require('fs'),
	cwd = process.cwd(),
	cliPath = cwd + '/node_modules/wee-core/cli.js';

// Register version and init command
program
	.version(require('../package').version)
	.usage('<command> [options]')
	.command('init [name]', 'create a new project');

fs.stat(cliPath, function(err) {
	if (err !== null) {
		fs.stat('./package.json', function(err) {
			if (err !== null) {
				console.log('Wee package.json not found in current directory');
				return;
			}

			fs.readFile('./package.json', function(err, data) {
				if (err) {
					console.log(err);
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

	// Register all other commands from specific project
	require(cliPath)(cwd, program);

	// Process cli input and execute command
	program.parse(process.argv);
});