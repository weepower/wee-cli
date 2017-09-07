#! /usr/bin/env node
/* global process, require */

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const program = require('commander');
const download = require('download-git-repo');
const home = require('user-home');
const ora = require('ora');
const merge = require('merge-dirs');
const extend = require('deep-extend');
const chalk = require('chalk');
const { spawn } = require('child_process');

program
	.usage('- wee init <project-name> [options]')
	.arguments('<project-name> [options]')
	.option('-b, --branch [branch-name]', 'set branch to download from wee')
	.option('-d, --default', 'keep default configurations and skip questions.');

program.parse(process.argv);

// Require project name be provided
if (program.args.length < 2) {
	program.help();
}

const weeRepoBranch = program.branch || 'master';
const weeRepo = `weepower/wee#${weeRepoBranch}`;
const tmpPath = home + '/.wee-cli';
const repoTmpPath = `${tmpPath}/wee/${weeRepoBranch}`;
const timer = ora('');
let origWeeJson;
let projectName = program.args[1];
let inPlace = projectName && path.resolve('../', projectName) === process.cwd();
let projectPath = inPlace ? process.cwd() : path.resolve(projectName);

if (! projectName) {
	options.help();
	return;
}

// If project name is current directory, confirm that we
// should build the project in place or create a child directory
if (inPlace) {
	inquirer.prompt([{
		type: 'confirm',
		message: 'Generate project in current directory?',
		name: 'ok'
	}]).then((answers) => {
		if (! answers.ok) {
			projectPath = path.resolve(projectName);
			return confirmExistingProject(projectPath);
		}

		return answers;
	}).then((answers) => {
		if (answers.ok) {
			run();
		}
	});
} else {
	confirmExistingProject(projectPath).then((answers) => {
		if (answers.ok) {
			run();
		}
	});
}

/**
 * Confirm that building project in existing directory is okay
 *
 * @param  {string} path
 */
function confirmExistingProject(path) {
	if (fs.pathExistsSync(projectPath)) {
		return inquirer.prompt([{
			type: 'confirm',
			message: 'Target directory exists. Continue?',
			name: 'ok'
		}]);
	}

	return Promise.resolve({ ok: true });
}

/**
 * Run init command
 *
 * @param  {string} path
 */
function run() {
	timer.text = `Downloading Wee - ${weeRepoBranch} branch`;

	fs.ensureDirSync(projectPath);

	timer.start();
	download(weeRepo, repoTmpPath, { clone: false }, (error) => {
		timer.stop();

		origWeeJson = fs.readJsonSync(`${repoTmpPath}/wee.json`);

		if (error) {
			console.log(error);
			return;
		}

		if (weeVersion() < 4) {
			console.log(chalk.red('This command requires a branch of wee >= version 4.0'));
			return;
		}

		let weeJson = extend({}, origWeeJson);
		let weePaths = weeJson.paths;
		let sequence = program.default ?
			Promise.resolve() :

			// Let user configure paths in project
			inquirer.prompt([
				{
					type: 'input',
					name: 'root',
					message: 'Web root directory name',
					default: weePaths.root
				},
				{
					type: 'input',
					name: 'source',
					message: 'Source directory name',
					default: weePaths.source
				},
				{
					type: 'input',
					name: 'build',
					message: 'Build directory name',
					default: weePaths.build
				}
			]).then((answers) => {
				weeJson.paths.root = answers.root;
				weeJson.paths.source = answers.source;
				weeJson.paths.build = answers.build;

				return inquirer.prompt([
					{
						type: 'input',
						name: 'assets',
						message: `Assets directory name - ie ${answers.root}/${weePaths.assets}`,
						default: weePaths.assets
					},
					{
						type: 'input',
						name: 'entryPoint',
						message: 'Entry point of application',
						default: weeJson.script.entry.app
					},
					{
						type: 'list',
						name: 'server',
						message: 'Type of development server',
						choices: ['static file', 'local domain'],
						default: 'static file'
					},
					{
						type: 'input',
						name: 'localUrl',
						message: 'Local project domain to proxy',
						default: weeJson.server.proxy,
						when(answers) {
							return answers.server === 'local domain';
						}
					}
				]);
			}).then((answers) => {
				weeJson.paths.assets = answers.assets;

				// Set entry point if different from default
				if (answers.entryPoint !== weeJson.script.entry.app) {
					delete weeJson.script.entry.app;
					weeJson.script.entry[answers.entryPoint.split('.')[0]] = answers.entryPoint;
				}

				if (answers.server !== 'static file') {
					weeJson.server.static = false;
				}

				// Set proxy URL
				weeJson.server.proxy = answers.localUrl;
			});

			sequence.then(() => {
				generateProject(weeJson);
			}).catch((error) => console.log(error));
	});
}

/**
 * Copy repo files into project
 */
function generateProject(weeJson) {
	const excludedFiles = ['README.md', 'LICENSE'];
	let existing = [];

	console.log(`Generating project...`);

	fs.readdirSync(repoTmpPath).forEach((name) => {
		if (excludedFiles.includes(name)) {
			return;
		}

		let pathKey = configPath(name);
		let srcPath = path.join(repoTmpPath, name);
		let destPath = path.join(projectPath, pathKey ? weeJson.paths[pathKey] : name);

		if (fs.pathExistsSync(destPath)) {
			existing.push({ src: srcPath, dest: destPath, resolveStrategy: 'overwrite' });
		} else {
			fs.copySync(srcPath, destPath);
		}
	});

	confirmExistingPaths(existing)
		.then((paths) => {
			paths.forEach((path) => {
				let stat = fs.statSync(path.dest);

				if (stat.isDirectory()) {
					merge.default(path.src, path.dest, path.resolveStrategy);
				} else {
					fs.copySync(path.src, path.dest);
				}
			});

			// Write final Wee JSON config
			fs.writeJsonSync(projectPath + '/wee.json', weeJson, { spaces: '\t' });
		}).then(() => {
			return inquirer.prompt([{
				type: 'confirm',
				name: 'npm',
				answer: 'ok',
				message: 'Install dependencies?'
			}]);
		}).then((answers) => {
			if (answers.npm) {
				return npmInstall();
			}

			return Promise.resolve({ npm: false });
		}).then((data) => {
			end(data.npm);
		}).catch((error) => {
			console.log(chalk.red(error));
			process.exit();
		});
}

/**
 * Retrieve key if name provided is the value of one of the path
 * config properties from weeJson
 *
 * @param  {string} name
 * @return {string|false}
 */
function configPath(name) {
	const paths = origWeeJson.paths;

	for (let key in paths) {
		if (paths[key] === name) {
			return key;
		}
	}

	return false;
}

/**
 * Let user decide what to do with each file/directory that already exists
 *
 * @param  {Array} files
 * @return {Promise}
 */
function confirmExistingPaths(files) {
	const promises = [];

	files.forEach((p) => {
		const name = normalizeName(p.dest);
		let stat = fs.statSync(p.dest);
		let question = {
			name,
			message: p.dest.split('/').pop()
		};

		if (stat.isDirectory()) {
			question.type = 'list';
			question.message = chalk.green(`/${question.message}`) + ' already exists. How should we resolve each file in this directory?';
			question.choices = ['skip', 'overwrite'];
			question.default = 'overwrite';
		} else if (stat.isFile()) {
			question.type = 'confirm';
			question.message = chalk.blue(question.message) + ' already exists. Overwrite?';
		}

		promises.push(question);
	});

	return inquirer.prompt(promises).then((answers) => {
		let filteredFiles = [];

		for (let key in answers) {
			if (answers[key]) {
				let file = files.find((f) => f.dest.includes(key));

				// Update resolve strategy and add to list for processing
				if (file) {
					file.resolveStrategy = answers[key];
					filteredFiles.push(file);
				}
			}
		}

		return filteredFiles;
	});
}

/**
 * Extract file name from path - exclude extension
 * @param  {string} path
 */
function normalizeName(path) {
	let name = path.split('/').pop();

	return name.charAt(0) === '.' ? name.split('.')[1] : name.split('.')[0];
}

/**
 * Install project dependencies
 *
 * @return {Promise}
 */
function npmInstall() {
	return new Promise((resolve, reject) => {
		let command = spawn('npm', ['install'], {
			cwd: projectPath,
			stdio: 'inherit'
		});

		command.on('error', (data) => {
			reject(data);
		});

		command.on('close', (code) => {
			resolve({ npm: true });
		});
	});
}

/**
 * Retrieve wee version number from package.json
 *
 * @return {number}
 */
function weeVersion() {
	return parseInt(fs.readJsonSync(`${repoTmpPath}/package.json`).version[0]);
}

/**
 * Confirm success of command
 *
 * @param  {Boolean} [npmInstalled=false]
 */
function end(npmInstalled = false) {
	console.log(`

	 __      __
	/  \\    /  \\ ____   ____
	\\   \\/\\/   // __ \\_/ __ \\
	 \\        /\\  ___/\\  ___/
	  \\__/\\  /  \\___  >\\___  >
	       \\/       \\/     \\/

`);

	console.log('Project created successfully!');

	if (npmInstalled) {
		console.log(`Run ${chalk.green('wee run')} inside project folder to start dev server...`);
	} else {
		console.log(`Run ${chalk.green('npm install')}, then ${chalk.green('wee run')} inside project folder to start dev server...`);
	}
}