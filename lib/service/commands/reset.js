const fs = require('fs-extra');
const trash = require('trash');
const { error, done } = require('../../utils/log');

module.exports = (api, options) => {
    api.registerCommand('reset', async (args) => {
        if (fs.existsSync(`${api.service.paths.components}/welcome`)) {
            try {await (trash(`${api.service.paths.components}/welcome`));
            } catch (e) {
                error(e);
            }
        }

        const filename = `${api.service.paths.root}/index.html`;
        const html = fs.readFileSync(filename, 'utf-8');
        const cleaned = html.replace(/<main(.|\n|\s)+main>/gmi, '');

        fs.writeFileSync(filename, cleaned, 'utf-8');

        done('Boilerplate removed');
    });
};
