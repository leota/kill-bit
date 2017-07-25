/* PRODUCTION REMINDER */
/* get EUR account ID instead of USD */
/* get EUR funds instead of USD */

var schedule = require('node-schedule');
var authedClient = require('./modules/client').authedClient;

var btcAccountId, eurAccountId;


// var j = schedule.scheduleJob('*/5 * * * * *', function(){
//   tradeTask();
// });

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
  // Run trade task
  tradeTask(authedClient, btcAccountId, eurAccountId);
});

function tradeTask(client, btcAccountId, eurAccountId) {
	//Get available funds from accounts
	var btcFunds, eurFunds;
	client.getAccount(btcAccountId, function(err, response, data) {
	  if (err) {
	    console.log(err);
	    return;
	  }
	  btcFunds = data.available;
	  client.getAccount(eurAccountId, function(err, response, data) {
	    if (err) {
	      console.log(err);
	      return;
	    }
	    eurFunds = data.available;
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
            	    	console.log("Place SELL order")
            	    }
            	    if(latestFill.side == 'sell') {
            	    	var limitPrice = (parseFloat(latestFill.price) - 1).toFixed(2);
            	    	var size = ((eurFunds - 0.5) / limitPrice).toFixed(5);
            	    	var args = {
            	    	  price: limitPrice.toString(), // EUR
            	    	  size: size.toString(),  // BTC
            	    	  product_id: 'BTC-EUR'
            	    	};
            	    	console.log("order: ", args);
            	    	// authedClient.buy(args, function(err, response, data) {
            	    	//   if (err) {
            	    	//     console.log(err);
            	    	//     return;
            	    	//   }
            	    	//   console.log("BUY order placed: ", data);
            	    	// });
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



// Schedule task every 10 seconds
// Get Last order
// if order.status == done
// 		if order.type == buy
//			get buy.price
//			get BTC funds
//			placeNewOrder(type: sell, amount: BTC funds,limit: buy.price + 1)
// 		if order.type == sell
//			get sell.price
//			get EUR funds
//			placeNewOrder(type: buy, amount: EUR funds,limit: sell.price - 1)
