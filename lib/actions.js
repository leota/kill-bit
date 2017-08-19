let a = module.exports = {}

a.sell = function(authedClient, args) {
	return new Promise((resolve, reject) => {
		authedClient.sell(args, function(err, response, data){
			if (err) {
			   return reject(err)
			}
			return resolve(data)
		})
	})
}

a.buy = function(authedClient, args) {
	return new Promise((resolve, reject) => {
		authedClient.buy(args, function(err, response, data){
			if (err) {
			   return reject(err)
			}
			return resolve(data)
		})
	})
}

a.cancelOrders = function(authedClient) {
	return new Promise((resolve, reject) => {
		authedClient.cancelOrders(function(err, response, result) {
			if (err) {
			   return reject(err)
			}
			return resolve(result);
		})
	})
}

a.getOrders = function(authedClient) {
    return new Promise((resolve, reject) => {
        authedClient.getOrders(function(err, response, data) {
            if (err) {
                return reject(err)
            }
            return resolve(data)
        })
    })
}

a.getLastFill = function(authedClient) {
    return new Promise((resolve, reject) => {
        authedClient.getFills(function(err, response, data) {
            if (err) {
                return reject(err)
            }
            if (data.length <= 0) { /* Alert if no fills are available */
                console.log("!!! Please place a manual order to begin auto-trading !!!")
                return
            }
            return resolve(data[0])
        })
    })
}

a.getLastTrade = function(publicClient) {
    return new Promise((resolve, reject) => {
        publicClient.getProductTrades(function(err, response, data) {
            if (err) {
                return reject(err)
            }
            return resolve(data[0])
        });
    })
}

a.getAccountsIDs = function(authedClient, selector) {
    return new Promise((resolve, reject) => {
        authedClient.getAccounts(function(err, response, data) {
            if (err) {
                return reject(err)
            }
            // Get Asset and Currency accounts IDs
            let asset = selector.split('-')[0]
            currency = selector.split('-')[1]
            for (let i = 0; i < data.length; i++) {
                if (data[i].currency == asset) {
                    assetAccoundID = data[i].id;
                }
                if (data[i].currency == currency) {
                    currencyAccountID = data[i].id;
                }
            }
            let accountsIDs = [assetAccoundID, currencyAccountID]
            return resolve(accountsIDs)
        });
    })
}

a.getAssetCapital = function(authedClient, assetAccountID) {
    return new Promise((resolve, reject) => {
        authedClient.getAccount(assetAccountID, function(err, response, data) {
            if (err) {
                return reject(err)
            }
            return resolve(data)
        })
    })
}

a.getCurrencyCapital = function(authedClient, currencyAccountID) {
    return new Promise((resolve, reject) => {
        authedClient.getAccount(currencyAccountID, function(err, response, data) {
            if (err) {
                return reject(err)
            }
            return resolve(data)
        })
    })
}