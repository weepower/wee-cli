const commander = require('commander');
const path = require('path');
const program = new commander.Command();

program.parse(process.argv);

require(path.resolve(__dirname, '../lib/commands/build'))(program);

