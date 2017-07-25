var schedule = require('node-schedule');
var authedClient = require('./modules/client').authedClient;

var btcAccountId, eurAccountId;


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
  // Run trade task repeatedly
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
	    console.log("Available Funds");
	    console.log("BTC: ", btcFunds);
	    console.log("EUR: ", eurFunds);
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
            	    	console.log("Please place a manual order to begin auto-trading")
            	    	return;
            	    }
            	    var latestFill = data[0];
            	    console.log("Latest fill: ", latestFill);
            	    // START PLACING orders
            	    if(latestFill.side == 'buy') {
            	    	var limitPrice = (parseFloat(latestFill.price) + 1).toFixed(2);
                    var size = btcFunds.toFixed(8);
                    var args = {
                      price: limitPrice.toString(), // EUR
                      size: size.toString(),  // BTC
                      product_id: 'BTC-EUR'
                    };

                    console.log("SELL order -> ", args);
                    authedClient.sell(args, function(err, response, data) {
                      if (err) {
                        console.log(err);
                        return;
                      }
                      console.log("SELL order placed: ", data);
                    });
            	    }
            	    if(latestFill.side == 'sell') {
            	    	var limitPrice = (parseFloat(latestFill.price) - 1).toFixed(2);
            	    	var size = ((eurFunds - 0.5) / limitPrice).toFixed(8);
            	    	var args = {
            	    	  price: limitPrice.toString(), // EUR
            	    	  size: size.toString(),  // BTC
            	    	  product_id: 'BTC-EUR'
            	    	};

            	    	authedClient.buy(args, function(err, response, data) {
            	    	  if (err) {
            	    	    console.log(err);
            	    	    return;
            	    	  }
            	    	  console.log("BUY order placed: ", data);
            	    	});
            	    }
            	});
            }
            // else try again
            else {
            	console.log("There are still open orders");
            	return;
            }
        });
	  });
	});
}