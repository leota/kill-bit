let schedule = require('node-schedule')
c = require('./modules/client')

let assetAccoundID, currencyAccountID
btcToKeep = 0.00005
eurToKeep = 1
INTERVAL = 0.20 // EUR

c.authedClient.getAccounts(function(err, response, data) {
  if (err) {
    console.log(err);
    return;
  }
  // Get Asset and Currency accounts IDs
  let asset = c.selector.split('-')[0]
  currency = c.selector.split('-')[1]
  for( let i = 0; i < data.length; i++) {
  	if(data[i].currency == asset) {
  		assetAccoundID = data[i].id;
  	}
  	if(data[i].currency == currency) {
  		currencyAccountID = data[i].id;
  	}
  }
  console.log("Accounts IDs: ", assetAccoundID, currencyAccountID);
  console.log(c.selector)
  // Run trade task every 10 seconds
  // var jobScheduler = schedule.scheduleJob('*/10 * * * * *', function(){
  //   tradeTask(authedClient, assetAccoundID, currencyAccountID);
  // });
});



/******** Trade Task Definition **********/

function tradeTask(client, assetAccoundID, currencyAccountID) {
	//Get available funds from accounts
	var btcFunds, eurFunds;
	client.getAccount(assetAccoundID, function(err, response, data) {
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