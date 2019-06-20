const chalk = require('chalk');
const ora = require('ora');
const spinner = ora();

let lastMessage;

function log(message) {
    console.log(message);
}

log.info = message => console.log(chalk.blue(message));
log.error = message => console.error(chalk.red(message));
log.warn = message => console.error(chalk.yellow(message));
log.withSpinner = (symbol, message) => {
    if (! message) {
        message = symbol;
        symbol = chalk.green('✔');
    }

    if (lastMessage) {
        spinner.stopAndPersist({
            symbol: lastMessage.symbol,
            text: lastMessage.text
        });
    }

    spinner.text = ' ' + message;
    lastMessage = {
        symbol: symbol + ' ',
        text: message,
    }

    spinner.start();
}

log.withSpinner.stop = (persist) => {
    if (lastMessage && persist !== false) {
        spinner.stopAndPersist({
            symbol: lastMessage.symbol,
            text: lastMessage.text
        });
    } else {
        spinner.stop();
    }

    lastMessage = null;
}

log.withSpinner.pauseSpinner = () => {
    spinner.stop();
}

log.withSpinner.resumeSpinner = () => {
    spinner.start();
}

module.exports = log;
