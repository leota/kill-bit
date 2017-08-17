var schedule = require('node-schedule');
var authedClient = require('./modules/client').authedClient;

var btcAccountId, eurAccountId;
var btcToKeep = 0.00005;
var eurToKeep = 1;
var INTERVAL = 0.20; // EUR


authedClient.getAccounts(function(err, response, data) {
  if (err) {
    console.log(err);
    return;
  }
  // Get BTC and EUR accounts ids
  for( var i = 0; i < data.length; i++) {
  	if(data[i].currency == 'BTC') {
  		btcAccountId = data[i].id;
  	}
  	if(data[i].currency == 'EUR') {
  		eurAccountId = data[i].id;
  	}
  }
  console.log("Accounts IDs: ", btcAccountId, eurAccountId);
  // Run trade task every 10 seconds
  var jobScheduler = schedule.scheduleJob('*/10 * * * * *', function(){
    tradeTask(authedClient, btcAccountId, eurAccountId);
  });
});



/******** Trade Task Definition **********/

function tradeTask(client, btcAccountId, eurAccountId) {
	//Get available funds from accounts
	var btcFunds, eurFunds;
	client.getAccount(btcAccountId, function(err, response, data) {
	  if (err) {
	    console.log(err);
	    return;
	  }
	  btcFunds = parseFloat(data.available);
	  client.getAccount(eurAccountId, function(err, response, data) {
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