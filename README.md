# GDAX-Trader
Tradiing bot for GDAX exchange market

## Project setup
```
git clone git@github.com:leota/GDAX-Trader.git
cd GDAX-Trader
npm install
```

## Project configuration
cp _config.js config.js <br>
Add your API keys to config.js

*IMPORTANT NOTE: By default it uses real API key. To use Sandbox modify client.js decommenting:
```
// sandboxApiURL = 'https://api-public.sandbox.gdax.com';
// authedClient = new Gdax.AuthenticatedClient(sandboxKey, sandboxB64secret, sandboxPassphrase, sandboxApiURL);
```

and commenting:
```
apiURL = 'https://api.gdax.com';
authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURL);
```
## Run
```
node index.js
```

Enjoy Trading!!
