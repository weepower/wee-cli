const chalk = require('chalk');
const ora = require('ora');

class Spinner {
    constructor(symbol, message = '') {
        this.spinner = ora();

        if (! message) {
            message = symbol;
            symbol = chalk.green('✔');
        }

        if (this.lastMessage) {
            this.spinner.stopAndPersist({
                symbol: this.lastMessage.symbol,
                text: this.lastMessage.text
            });
        }

        this.spinner.start();
    }

    update(symbol, message = '') {
        this.lastMessage = {
            symbol: symbol + ' ',
            text: message,
        }
    }

    stop(persist) {
        if (this.lastMessage && persist !== false) {
            this.spinner.stopAndPersist({
                symbol: this.lastMessage.symbol,
                text: this.lastMessage.text
            });
        } else {
            this.spinner.stop();
        }

        this.lastMessage = null;
    }

    pause() {
        this.spinner.stop();
    }

    resume() {
        this.spinner.start();
    }
}

function log(message) {
    console.log(message);
}

log.info = message => console.log(chalk.blue(message));
log.error = message => console.error(chalk.red(message));
log.warn = message => console.error(chalk.yellow(message));
log.withSpinner = (symbol, message) => new Spinner(symbol, message);

module.exports = log;
