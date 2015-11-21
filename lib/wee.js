#! /usr/bin/env node

// Wee (weepower.com)
// Licensed under Apache 2 (http://www.apache.org/licenses/LICENSE-2.0)
// DO NOT MODIFY

/* global process */

var fs = require('fs'),
	cwd = process.cwd(),
	cliPath = cwd + '/node_modules/wee-core/cli.js';

fs.stat(cliPath, function(err, stat) {
	if (err === null) {
		require(cliPath)(cwd);
	} else {
		fs.stat('./package.json', function(err, stat) {
			if (err === null) {
				fs.readFile('./package.json', function(err, data) {
					if (err) {
						console.log(err);
					}

					var config = JSON.parse(data);

					if (config.name == 'wee') {
						console.log('Wee core not found. Run "npm install" and try again.');
					} else {
						console.log('The local package.json is not formatted for Wee.');
					}
				});
			} else {
				console.log('Wee package.json not found in the current directory.');
			}
		});
	}
});