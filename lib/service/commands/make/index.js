// TODO: Probably move this into utils
const path = require('path');
const fs = require('fs-extra');
const { done, error, log } = require('../../../utils/log');

function fileFormat(string) {
    return string.split(/(?=[A-Z])/g).map((word) => word.toLowerCase())
        .join('-');
}

module.exports = (api, options) => {
    api.registerCommand('make:command', async (args) => {
        const fileName = fileFormat(args.name);
        const commandPath = path.resolve(api.service.context, api.service.paths.commands);
        const templatesPath = path.resolve(__dirname, 'templates');
        const filePath = `${commandPath}/${fileName}`;
        const content = eval('`' + fs.readFileSync(`${templatesPath}/command.js`) + '`');

        fs.writeFileSync(`${commandPath}/${fileName}.js`, content);
    });

    api.registerCommand('make:component', async (args) => {
        const fileName = fileFormat(args.name);
        const componentPath = path.resolve(api.service.context, `${options.paths.components}/${fileName}`);
        const templatesPath = path.resolve(__dirname, 'templates/components');
        const fileExt = {
            style: 'scss',
            script: options.vue ? 'vue' : 'js'
        };
        const constructorName = fileName.split('-').map((word, i) => {
            return word.substr(0, 1).toUpperCase() + word.substr(1);
        }).join('');
        const variableName = constructorName.substr(0, 1).toLowerCase() + constructorName.substr(1);
        const filePath = `${componentPath}/${fileName}`;
        const rootComponentScript = eval('`' + fs.readFileSync(`${templatesPath}/root-component-template.js`) + '`');

        // Create component directory
        if (fs.existsSync(componentPath)) {
            log();
            error(`component named "${fileName}" already exists`);
            process.exit();
        }

        fs.mkdirSync(componentPath);

        if (args.clean) {
            fs.ensureFileSync(`${componentPath}/index.${fileExt.script}`);
            fs.ensureFileSync(`${componentPath}/index.${fileExt.style}`);

            if (args.hasOwnProperty('root') && args.hasOwnProperty('vue')) {
                fs.ensureFileSync(`${componentPath}/index.js`);
            }
        } else {
            fs.copySync(`${templatesPath}/template.${fileExt.script}`, `${componentPath}/index.${fileExt.script}`);
            fs.copySync(`${templatesPath}/template.${fileExt.style}`, `${componentPath}/index.${fileExt.style}`);

            if (options.hasOwnProperty('root') && options.hasOwnProperty('vue')) {
                fs.writeFileSync(`${componentPath}/index.js`, rootComponentScript);
            }
        }

        log();
        done(`Component "${fileName}" created successfully`);
    });
};
