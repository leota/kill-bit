var Gdax = require('gdax');
var config = require('./config');

/**
 * Enter your GDAX Sandbox API key, API secret, and the passphrase
 * you specified when creating the API key pair.
 */

/* SANDBOX keys */
var sandboxKey = config.sandboxKey;
var sandboxB64secret = config.sandboxB64secret
var sandboxPassphrase = config.sandboxPassphrase;

/* REAL Keys */
var key = config.key;
var b64secret = config.b64secret;
var passphrase = config.passphrase;

// For the sandbox, use this
// var sandboxApiURL = 'https://api-public.sandbox.gdax.com';
// var authedClient = new Gdax.AuthenticatedClient(sandboxKey, sandboxB64secret, sandboxPassphrase, sandboxApiURL);

// For the live API, use this. Please use the sandbox while testing.
var apiURL = 'https://api.gdax.com';
var authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURL);


exports.authedClient = authedClient;
exports.publicClient = new Gdax.PublicClient('BTC-USD', apiURL);