const merge = require('deepmerge');
const YAML = require('yamljs');
const github = require('octonode');
const App = require('@octokit/app')
const config = require('./config');

class Application {
    constructor(body, headers, app) {
        this.body = body;
        this.headers = headers;
        this.app = app;
        this.appId = config[this.app.name].appId
        this.privateKey = config[this.app.name].privateKey;
        this.secret = config[this.AppName].secret
        this.client = null
        this.owner = body.repository.owner.login;
        this.repo = body.repository.name;
    }

    validate() {
        console.log('Validating request from github...')
        if (!this.secret) throw new Error("Secret not found for application");

        if (!verify(this.secret, this.body, this.headers["x-hub-signature"])) {
        throw new Error("Signature does not match event payload and secert");
        }
    }

    async init() {
        console.log('Creating github client...')
        const githubApp = new App({id: this.appId, privateKey: this.privateKey })

        const token = await githubApp.getInstallationAccessToken({installationId: this.body.installation.id})
        this.client = github.client(token)
    }

    async getConfig() {
        console.log('Getting repo config...')
        const repoConfig = await getConfigFile(this.owner, this.repo)
        console.log('Repo config: ', repoConfig)

        if(repoConfig && repoConfig.extends) {
            const { owner, repo, path } = repoConfig.extends;
            console.log('Getting extended config...')
            const extendedConfig = await getConfigFile(owner, repo, path)
            console.log('Extended config: ', extendedConfig)
            return merge.all([repoConfig, extendedConfig]);
        } else {
            console.log('Getting default config...')
            const defaultConfig = await getConfigFile()
            console.log('Default config: ', defaultConfig)
            return defaultConfig
        }
    }

    async getConfigFile(owner = 'CSGitBots', repo = 'git-app-platform', path = '.github/gitbots.yml') {
        try {
            const resp = await this.client.repo(`${owner}/${repo}`).contentsAsync(path)
            return base64ToYaml(resp[0].content)
        } catch(e) {
            console.log(e)
            console.log('Could not retrieve configs')
            return null
        }
    }

    async handle() {
        let cb;
        switch(this.app.type) {
            case 'status':
                cb = this.createStatus;
                break;
        }

        await this.app.handle(this.body, this.config, cb)
    }

    async createStatus({context, description, state}) {
        console.log(`Setting status  ${state} on ${this.repo}/${this.owner}`)

        return await this.client.repo(`${this.owner}/${this.repo}`).statusAsync(this.body.pull_request.head.sha, {state, description, context})
    }

    async createReview({pass, approveMsg, rejectMsg}) {
        let event = pass ? 'APPROVE' : 'REQUEST_CHANGES'
        let body = pass ? approveMsg : rejectMsg

        const reviews = await this.client.pr(`${owner}/${repo}`, number).reviewsAsync()

        const conditional = reviewChanged(reviews, req.app, event)
        console.log('Conditional: ', conditional)
        if(conditional) {
            console.log(`Creating review ${event} on ${repo}/${owner}`)
            return await this.client.pr(`${owner}/${repo}`, number).createReviewAsync({event, body})
        }

        console.log('Current pull request review same as previous')
    }
    reviewChanged(reviews, user, event) {
        const newReview = event === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';

        try {
            const currentReview = reviews[0].filter( v => {
                return v.user.login === `${user}[bot]`
            }).pop().state

            console.log('Current Review: ', currentReview)
            console.log('New Review: ', newReview)

            return currentReview !== newReview
        } catch(e) {
            console.log(e)
            return true
        }
    }
}

function base64ToYaml(string) {
    const buff = new Buffer(string, 'base64');
    return YAML.parse(buff.toString('ascii'));
}


