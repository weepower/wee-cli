const chalk = require('chalk');
const padEnd = require('string.prototype.padend');
const { error, log } = require('../../utils/log');

function getPadLength(obj) {
    let longest = 10;

    for (const name in obj) {
        if (name.length + 1 > longest) {
            longest = name.length + 1
        }
    }

    return longest;
}


module.exports = (api, options) => {
    api.registerCommand('help', (args) => {
        const command = args._[0];

        if (! command) {
            logMainHelp();
        } else {
            logHelpForCommand(command, api.service.commands[command]);
        }
    });

    function logMainHelp () {
        log(
            `\n  Usage: wee <command> [options]\n` +
            `\n  Commands:\n`
        );

        const commands = api.service.commands
        const padLength = getPadLength(commands);

        for (const name in commands) {
            if (name !== 'help') {
                const opts = commands[name].opts || {};

                log(`    ${chalk.blue(padEnd(name, padLength))}${opts.description || ''}`);
            }
        }

        log(`\n  run ${chalk.green(`wee help [command]`)} for usage of a specific command.\n`);
    }

    function logHelpForCommand (name, command) {
        if (! command) {
            error(`\n  command "${name}" does not exist.`);
        } else {
            const opts = command.opts || {};

            if (opts.usage) {
                log(`\n  Usage: ${opts.usage}`)
            }

            if (opts.options) {
                log(`\n  Options:\n`)
                const padLength = getPadLength(opts.options);

                for (const name in opts.options) {
                    log(`    ${chalk.blue(padEnd(name, padLength))}${opts.options[name]}`);
                }
            }

            if (opts.details) {
                log();
                log(opts.details.split('\n').map(line => `  ${line}`).join('\n'));
            }

            log();
        }
    }
}
