const Service = require('./Service');

module.exports = (context) => {
    return new Service(context);
}
