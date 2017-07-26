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
## Run
```
node index.js
```

# Heroku
## Deploy
In the app root folder
```
# create new heroku app if you don'thave one
heroku create my-app
# set 1 worker to run the job
heroku ps:scale worker=1
# deploy 
git push heroku master
```

Ensure that at least one instance of the app is running:
```
heroku ps:scale worker=1
```
## Commit changes
```
git add .
git commit -m "message"
git push heroku master
```
## View logs
```
heroku logs --tail
```
## Scale the App
```
# check number of current running dynos
heroku ps

# scale to 4 web dynos
heroku ps:scale web=4
# scale to 4 worker dynos
heroku ps:scale worker=4
```
## Run the app locally
```
heroku local web
```


Enjoy Trading!!
