module.exports = (api, options) => {
    api.registerCommand('component', {
        usage: 'wee component [options]',
        description: 'create component',
        options: {
            '--name': 'the name of the component',
            '--vue': 'make a vue component',
            '--root': 'make a root vue component',
            '--empty': 'create empty files',
        },
    }, async (args) => {
        // info('Starting development server...\n\n');

        // console.log(args);

        // return new Promise((resolve, reject) => {

        // });
    });
};
