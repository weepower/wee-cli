const fs = require('fs');
const path = require('path');
const { log } = require('../../../../utils');

module.exports = (api) => {
    return new Promise((resolve, reject) => {
        log.withSpinner('Prebuild');

        /**
         * Build the breakpoint
         *
         * @param {String} breakpoint
         * @param {Number} count
         */
        const buildBreakpoint = (breakpoint, count) => `@include ${breakpoint} { html { font-family: '${count}'; } }\n`;

        /**
         * Create a mixin based on the provided breakpoint information
         *
         * @param {String} breakpoint
         * @param {Number} condition
         */
        const buildMixin = (breakpoint, condition) => `@mixin ${breakpoint}() { @media (min-width: ${condition}px) { @content; } }\n`;

        /**
         * Create the responsive.scss file required for $screen
         * to work properly
         *
         * @param {*} breakpoints
         */
        const createResponsiveFiles = (breakpoints) => {
            let count = 2;
            const result = {
                responsive: '/* stylelint-disable */\n\n',
                mixins: '/* stylelint-disable */\n\n',
            };

            Object.keys(breakpoints).forEach((breakpoint) => {
                result.responsive += buildBreakpoint(breakpoint, count);
                result.mixins += buildMixin(breakpoint, breakpoints[breakpoint]);
                count++;
            });

            if (! fs.existsSync(api.paths.temp)) {
                fs.mkdirSync(api.paths.temp);
            }

            fs.writeFileSync(path.resolve(api.paths.temp, 'responsive.scss'), result.responsive, 'utf-8');
            fs.writeFileSync(path.resolve(api.paths.temp, 'mixins.scss'), result.mixins, 'utf-8');
        };

        // Create temp responsive.scss file
        createResponsiveFiles(api.config.style.breakpoints);

        log.withSpinner.stop();
    });
}
