let pulumi = require("@pulumi/pulumi");
let config = new pulumi.Config()
let wipConfig = new pulumi.Config('wip');
let env;

if (config.require('env') === 'prod') {
    env = require('../.env.js')
} else {
    env = require('../.env.staging.js');
}

module.exports = {
    wip: {
        appId: wipConfig.require('appId'),
        privateKey: env.wip,
        secret: wipConfig.require("secret")
    }
};
