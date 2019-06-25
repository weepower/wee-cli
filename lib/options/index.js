const { createSchema, validate } = require('./validate');

const schema = createSchema(joi => joi.object({
    appName: joi.string().optional(),
    paths: joi.object({
        root: joi.string(),
        assets: joi.string(),
        source: joi.string(),
        components: joi.string(),
        build: joi.string(),
    }),
    script: joi.object({
        entry: joi.object({
            app: joi.string(),
        }),
        output: joi.object({
            filename: joi.string(),
            chunkFilename: joi.string(),
        }),
    }),
    manifest: joi.object({
        enabled: joi.boolean(),
        options: joi.object({
            filename: joi.string(),
        }),
    }),
    chunking: joi.object(),
    style: joi.object({
        entry: joi.object(),
        output: joi.object({
            filename: joi.string(),
            chunkFilename: joi.string(),
        }),
        breakpoints: joi.object({
            mobileLandscape: joi.number().integer(),
            tablet: joi.number().integer(),
            desktop: joi.number().integer(),
            desktop2: joi.number().integer(),
            desktop3: joi.number().integer(),
        }),
        breakpointOffset: joi.number().integer(),
    }),
    purgeCss: joi.object({
        enabled: joi.boolean(),
        paths: joi.alternatives().try(
            joi.array(),
            joi.string()
          ),
    }),
    analyze: joi.boolean(),
    configureWebpack: joi.object(),
    chainWebpack: joi.func(),
    server: joi.object({
        ghostMode: joi.boolean(),
        host: joi.string(),
        port: joi.number().integer(),
        https: joi.boolean(),
        proxy: joi.string(),
        static: joi.boolean(),
        reload: {
            enable: joi.boolean(),
            watch: {
                root: joi.boolean(),
                paths: joi.array(),
                extensions: joi.array(),
                ignore: joi.array(),
            },
        },
    }),
}));

exports.validate = (options, cb) => {
    validate(options, schema, cb);
}

exports.defaults = () => ({
    appName: 'Wee',
    paths: {
        root: 'public',
        assets: 'assets',
        source: 'source',
        components: 'source/components',
        build: 'build',
    },
    script: {
        entry: {
            app: 'app.js',
        },
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
        },
    },
    manifest: {
        enabled: false,
        options: {
            filename: 'assets.json',
        },
    },
    chunking: {},
    style: {
        entry: {},
        output: {
            filename: '[name].min.css',
            chunkFilename: '[name].min.css',
        },
        breakpoints: {
            mobileLandscape: 480,
            tablet: 768,
            desktop: 1024,
            desktop2: 1280,
            desktop3: 1440,
        },
        breakpointOffset: 25,
    },
    purgeCss: {
        enabled: false,
        paths: [
            'public/index.html',
        ],
    },
    analyze: false,
    configureWebpack: {},
    chainWebpack: (config) => {},
    server: {
        ghostMode: false,
        host: 'auto',
        port: 9000,
        https: true,
        proxy: 'https://wee.dev',
        static: true,
        reload: {
            enable: true,
            watch: {
                root: true,
                paths: [],
                extensions: [
                    'html',
                ],
                ignore: [],
            },
        },
    },
});
