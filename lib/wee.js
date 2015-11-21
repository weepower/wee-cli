#! /usr/bin/env node

// Wee (weepower.com)
// Licensed under Apache 2 (http://www.apache.org/licenses/LICENSE-2.0)
// DO NOT MODIFY

/* global process, require */

var fs = require('fs'),
	cwd = process.cwd(),
	cliPath = cwd + '/node_modules/wee-core/cli.js';

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

				if (config.name == 'wee') {
					console.log('Run "npm install" to install Wee core');
				} else {
					console.log('The package.json is not compatible with Wee');
				}
			});
		});

		return;
	}

	// Interface to core package
	require(cliPath)(cwd);
});