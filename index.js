let schedule = require('node-schedule')
    colors = require('colors')
    moment = require('moment')
    c = require('./lib/client')
    a = require('./lib/actions')

/* GLOBAL VARIABLES */
let assetAccountID, currencyAccountID, startAssetCapital, startCurrencyCapital, lastTradeTime, lastTradePrice,
asset = c.selector.split('-')[0]
currency = c.selector.split('-')[1]
btcToKeep = 0.00005
eurToKeep = 1
INTERVAL = 0.20 // EUR

a.getAccountsIDs(c.authedClient, c.selector).then( res => {
  assetAccountID = res[0]
  currencyAccountID = res[1]
  return true
}).catch(err => {
  console.log("ERROR[getAccountsIDs]:".red, err)
})
.then( () => {
  a.getAssetCapital(c.authedClient, assetAccountID).then( res => {
    startAssetCapital = parseFloat(res.balance).toFixed(5)
    return true
  }).catch(err => {
    console.log("ERROR[getAssetCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getAssetCapitalWrap]:".red, err)
})
.then( () => {
  a.getCurrencyCapital(c.authedClient, currencyAccountID).then( res => {
    startCurrencyCapital = parseFloat(res.balance).toFixed(2)
    console.log("STARTING BALANCE:".green, startAssetCapital.yellow, asset.yellow, '---', startCurrencyCapital.yellow, currency.yellow)
    return true
  }).catch(err => {
    console.log("ERROR[getCurrencyCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getCurrencyCapitalWrap]:".red, err)
})

  // Run trade task every 10 seconds
  // let jobScheduler = schedule.scheduleJob('*/10 * * * * *', function(){
  //   trade(c.authedClient, c.publicClient, assetAccountID, currencyAccountID);
  // });

function trade(authedClient, publicClient, assetAccountID, currencyAccountID) {
  a.getLastTrade(publicClient).then(res => {
    lastTradeTime = moment(res.time).format('DD-MM-YYYY HH:mm:ss')
    lastTradePrice = parseFloat(res.price)
    console.log(lastTradeTime.grey, lastTradePrice.toFixed(2).cyan)
  }).catch(err => {
    console.log("ERROR[getLastTradePrice]:".red, err)
  })
}

  // a.getCurrencyCapital(c.authedClient).then(res => {
  //   console.log("curr cap",res)
  // })

/******** Trade Task Definition **********/

function tradeTask(client, assetAccountID, currencyAccountID) {
	//Get available funds from accounts
	var btcFunds, eurFunds;
	client.getAccount(assetAccountID, function(err, response, data) {
	  if (err) {
	    console.log(err);
	    return;
	  }
	  btcFunds = parseFloat(data.available);
	  client.getAccount(currencyAccountID, function(err, response, data) {
	    if (err) {
	      console.log(err);
	      return;
	    }
	    eurFunds = parseFloat(data.available);
	    console.log("$$$ Available Funds $$$");
	    console.log("BTC: ", btcFunds.toFixed(5));
	    console.log("EUR: ", eurFunds.toFixed(5));
      console.log("$$$$$$$$$$$$$$$$$$$$$$$");
    	//Get list of open orders
    	client.getOrders(function(err, response, data) {
            if (err) {
                console.log("[getOrders]: ", err);
                return;
            }
            console.log("Current open orders: ", data);
            ordersLength = data.length;
            // If there is no open orders
            if(ordersLength <= 0) {
            	// Get list of fills
            	client.getFills(function(err, response, data) { /* TODO: get paginated fills*/
            	    if (err) {
            	        console.log(err);
            	        return;
            	    }
            	    if(data.length <= 0) { /* Alert if no fills are available */
            	    	console.log("!!! Please place a manual order to begin auto-trading !!!")
            	    	return;
            	    }
            	    var latestFill = data[0];
            	    console.log("---> Latest fill: ", latestFill);
            	    // START PLACING orders
            	    if(latestFill.side == 'buy') {
            	    	var limitPrice = (parseFloat(latestFill.price) + INTERVAL).toFixed(2);
                    var size = (btcFunds - btcToKeep).toFixed(8);
                    var args = {
                      price: limitPrice.toString(), // EUR
                      size: size.toString(),  // BTC
                      product_id: 'BTC-EUR',
                      post_only: true
                    };
                    authedClient.sell(args, function(err, response, data) {
                      if (err) {
                        console.log(err);
                        return;
                      }
                      console.log("<--- SELL order placed: ", data);
                    });
            	    }
            	    if(latestFill.side == 'sell') {
            	    	var limitPrice = (parseFloat(latestFill.price) - INTERVAL).toFixed(2);
            	    	var size = ((eurFunds - eurToKeep) / limitPrice).toFixed(8);
            	    	var args = {
            	    	  price: limitPrice.toString(), // EUR
            	    	  size: size.toString(),  // BTC
            	    	  product_id: 'BTC-EUR',
                      post_only: true
            	    	};
            	    	authedClient.buy(args, function(err, response, data) {
            	    	  if (err) {
            	    	    console.log(err);
            	    	    return;
            	    	  }
            	    	  console.log("<--- BUY order placed: ", data);
            	    	});
            	    }
            	});
            }
            // else try again
            else {
            	console.log("---> THERE ARE STILL OPEN ORDERS <---");
            	return;
            }
        });
	  });
	});
}