const github = require('octonode')
const YAML = require('yamljs');

describe('octonode', () => {
    const client = github.client('b1ca3e40e62558c8701d9cbde83314292094c161')
    it('creates pr client', async () => {
        const ghpr = client.pr('CodeSherpas/gitmvp-test-staging', 37)
        expect(typeof ghpr).toBe('object');
        // console.log(result)

    })

    it('gets contents', async () => {
        const repo = client.repo('CodeSherpas/gitmvp-test-staging')
        const resp = await repo.contentsAsync('.github/lintTitle.yml')
        expect(typeof resp[0].content).toBe('string')
        const config = base64ToYaml(resp[0].content)

        expect(config).toBe(null)
    
    })
})

function base64ToYaml(string) {
    const buff = new Buffer(string, 'base64');
    return YAML.parse(buff.toString('ascii'));
}
