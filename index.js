const github = require('./github');
const cloud = require("@pulumi/cloud-aws");
const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");


const api = new cloud.API(pulumi.getStack());

github.register(api)

exports.endpointJs = api.publish().url;
