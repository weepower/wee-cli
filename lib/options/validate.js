const joi = require('@hapi/joi');

exports.createSchema = fn => fn(joi);

exports.validate = (obj, schema, cb) => {
    joi.validate(obj, schema, {}, err => {
        if (err) {
            cb(err.message);

            process.exit(1);
        }
    });
}

exports.validateSync = (obj, schema) => {
    const result = joi.validate(obj, schema);

    if (result.error) {
        throw result.error;
    }
}
