# GDAX-Trader
Tradiing bot for GDAX exchange market

## Project setup
```
git clone git@github.com:leota/GDAX-Trader.git
cd GDAX-Trader
npm install
```

## Project configuration
Rename /modules/_config.js to "config.js" <br>
Add your API keys

## Run
```
node index.js
```

*IMPORTANT NOTE: By default it uses real API key. To use Sandbox modify client.js decommenting:
```
// var sandboxApiURL = 'https://api-public.sandbox.gdax.com';
// var authedClient = new Gdax.AuthenticatedClient(sandboxKey, sandboxB64secret, sandboxPassphrase, sandboxApiURL);
```

and commenting:
```
var apiURL = 'https://api.gdax.com';
var authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURL);
```

Enjoy Trading!!
