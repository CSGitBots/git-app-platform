const Application = require('./Application')
const wip = require('@codesherpas/wip');

module.exports = { register }

const baseURL = '/github'
const apps = [
    {
        name: 'wip',
        handle: wip.handle,
        type: 'status'
    }
]

function register(api) {
    apps.forEach( app => {
        console.log('Registering app: ', app)
        api.post(`${baseURL}/${app.name}`, registerApp(app))
    
    })
}

function registerApp(app) {
    return async function(req, res) {
        const body = JSON.parse(req.body.toString('utf-8'))
        const ghapp = new Application(body, req.headers, app)
        
        try {
            ghapp.validate()
        } catch(e) {
            return res.status(401).json({message: 'Not authorized to make this request'});
        }

        try {
            await ghapp.init()
            await ghapp.getConfig()
            await ghapp.handle()
            return res.status(200).json({message: 'Successfully handled request'})
        } catch(e) {
            console.log(e)
            return res.status(500).json({message: 'Error creating github client'})
        }
    }
}




