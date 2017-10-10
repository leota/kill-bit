let c = module.exports = {}

/**
 * Enter your GDAX Sandbox API key, API secret, and the passphrase
 * you specified when creating the API key pair.
 */

/* SANDBOX keys */
c.sandboxKey = 'your sandbox api key'
c.sandboxB64secret = 'your sandbox secret key'
c.sandboxPassphrase = 'your sandbox passphrase'

/* REAL Keys */
c.key = 'your api key'
c.b64secret = 'your secret key'
c.passphrase = 'your passphrase'

c.selector = 'BTC-EUR'
c.mode = 'sandbox' // <-- allowed values: ['sandbox', 'live']