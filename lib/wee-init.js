#! /usr/bin/env node

/* global process, require */

require('commander')
	.usage('- wee init <project-name> [options]')
	.option('-t, --template [value]', 'create a new project from a repo template')
	.option('-e, --existing', 'add wee to an existing project')
	.option('-s, --source [directory]', 'directory to add default source files')
	.option('-v, --vue', 'create project with vue dependencies and config')
	.parse(process.argv);

// TODO: Use https://github.com/vuejs/vue-cli/blob/master/bin/vue-init for reference
// TODO: Build all options