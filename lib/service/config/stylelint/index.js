const path = require('path');
const fs = require('fs');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const userConfigPath = path.join(api.service.context, '.stylelintrc.js');
        let configFile = path.resolve(__dirname, '.stylelintrc.js');

        if (fs.existsSync(userConfigPath)) {
            configFile = userConfigPath;
        }

        // Lint styles
        config.plugin('stylelint')
            .use(require('stylelint-webpack-plugin'), [{
                // Set context so we're not linting files in vendor or node_modules
                context: api.service.paths.source,
                configFile,

                formatter: require('stylelint-codeframe-formatter'),
            }])
            .end();
    });
}
