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

a.tryBuy = function(authedClient, currencyAccountID, lastTradePrice, selector) {
	highest = lastTradePrice
	a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice - 0.1
			size = 0.01
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.buy(authedClient, args)
		action = 'buy'
	}).catch(err => {
		console.log("ERROR[retryBUY getCurrencyCapital]:".red, err)
	})
}

a.trySell = function(authedClient, assetAccountID, lastTradePrice, selector) {
	lowest = lastTradePrice
	a.getAssetCapital(authedClient, assetAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice + 0.1
			size = 0.01
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.sell(authedClient, args)
		action = 'sell'
	}).catch(err => {
		console.log("ERROR[retrySELL getAssetCapital]:".red, err)
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
                    assetAccountID = data[i].id;
                }
                if (data[i].currency == currency) {
                    currencyAccountID = data[i].id;
                }
            }
            let accountsIDs = [assetAccountID, currencyAccountID]
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