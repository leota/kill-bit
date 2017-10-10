let Gdax = require('gdax')
config = require('../config')

let c = module.exports = {}

mode = config.mode

/* SANDBOX keys */
sandboxApiURL = 'https://api-public.sandbox.gdax.com'
sandboxKey = config.sandboxKey
sandboxB64secret = config.sandboxB64secret
sandboxPassphrase = config.sandboxPassphrase

/* REAL Keys */
apiURL = 'https://api.gdax.com'
key = config.key
b64secret = config.b64secret
passphrase = config.passphrase

/* export client config */
if (mode === 'live') {
    c.authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURL)
} else {
    c.authedClient = new Gdax.AuthenticatedClient(sandboxKey, sandboxB64secret, sandboxPassphrase, sandboxApiURL)
}
c.selector = config.selector
c.publicClient = new Gdax.PublicClient(c.selector, apiURL)