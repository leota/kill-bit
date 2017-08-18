let Gdax = require('gdax')
config = require('../config')

let c = module.exports = {}

/* SANDBOX keys */
sandboxKey = config.sandboxKey
sandboxB64secret = config.sandboxB64secret
sandboxPassphrase = config.sandboxPassphrase

/* REAL Keys */
key = config.key
b64secret = config.b64secret
passphrase = config.passphrase

// For the sandbox, use this
// sandboxApiURL = 'https://api-public.sandbox.gdax.com'
// authedClient = new Gdax.AuthenticatedClient(sandboxKey, sandboxB64secret, sandboxPassphrase, sandboxApiURL)

// For the live API, use this. Please use the sandbox while testing.
apiURL = 'https://api.gdax.com'
c.selector = config.selector
c.authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURL)
c.publicClient = new Gdax.PublicClient(c.selector, apiURL)