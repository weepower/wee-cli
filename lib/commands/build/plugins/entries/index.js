const { log } = require('../../../../utils');

module.exports = (api) => {
    /**
     * Process the entries from the wee.config.js into something
     * chain webpack can consume
     *
     * @param {Config} config - the config object
     * @param {Object} entries - the object of entries to process
     * @param {String} type - the type of entries, e.g. 'styles' or 'scripts'
     */
    const addEntries = (config, entries, type) => {
        Object.keys(entries).forEach((entry) => {
            const files = entries[entry];
            const entryConfig = config.entry(entry);
            const entryType = api.paths[type];

            if (Array.isArray(files)) {
                files.forEach(entry => entryConfig.add(`${entryType}/${entry}`));
            } else {
                entryConfig.add(`${entryType}/${files}`);
            }
        });
    };

    /**
     * Calculate breakpoints with offset included
     *
     * @param {Object} breakpoints
     * @param {number} offset
     * @returns {Object}
     */
    const calcBreakpoints = (breakpoints, offset) => {
        const breaks = { ...breakpoints };

        Object.keys(breaks).forEach((breakpoint) => {
            breaks[breakpoint] = breakpoints[breakpoint] - offset;
        });

        return breaks;
    };

    return new Promise((resolve) => {
        api.chainWebpack(config => {
            // Add script entries
            addEntries(config, api.config.script.entry, 'scripts');

            // Add style entries
            addEntries(config, api.config.style.entry, 'styles');

            // Set the output options
            if (Object.keys(api.config.script.output).length) {
                if (api.config.script.output.filename) {
                    config.output.filename(api.config.script.output.filename);
                }

                if (api.config.script.output.chunkFilename) {
                    config.output.chunkFilename(api.config.script.output.chunkFilename);
                }
            }

            config.output
                .path(api.paths.output.scripts)
                .publicPath(`/${api.paths.assets}/scripts/`);

            resolve();
        });
    });
}
