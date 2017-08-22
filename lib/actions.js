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

a.profitBuy = function(authedClient, currencyAccountID, lastTradePrice, selector) {
	highest = lastTradePrice
	a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice - 0.1
			size = ((available/2) / limitPrice).toFixed(8)
			console.log('size:', size)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.buy(authedClient, args)
		action = 'buy'
		console.log('**** PROFIT BUY ****')
	}).catch(err => {
		console.log("ERROR[profitBUY getCurrencyCapital]:".red, err)
	})
}

a.profitSell = function(authedClient, assetAccountID, lastTradePrice, selector) {
	lowest = lastTradePrice
	a.getAssetCapital(authedClient, assetAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice + 0.1
			size = (available/2).toFixed(8)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.sell(authedClient, args)
		panic = false
		action = 'sell'
		console.log('**** PROFIT SELL ****')
	}).catch(err => {
		console.log("ERROR[profitSELL getAssetCapital]:".red, err)
	})
}

a.retryBuy = function(authedClient, currencyAccountID, lastTradePrice, selector) {
	highest = lastTradePrice
	a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice - 0.1
			size = ((available - 0.5) / limitPrice).toFixed(8)
			console.log('size:', size)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.buy(authedClient, args)
		action = 'buy'
		console.log('**** RETRY BUY ****')
	}).catch(err => {
		console.log("ERROR[retryBUY getCurrencyCapital]:".red, err)
	})
}

a.retrySell = function(authedClient, assetAccountID, lastTradePrice, selector) {
	lowest = lastTradePrice
	a.getAssetCapital(authedClient, assetAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice + 0.1
			size = (available - 0.001).toFixed(8)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.sell(authedClient, args)
		panic = false
		action = 'sell'
		console.log('**** RETRY SELL ****')
	}).catch(err => {
		console.log("ERROR[retrySELL getAssetCapital]:".red, err)
	})
}

a.panicBuy = function(authedClient, currencyAccountID, lastTradePrice, selector) {
	a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice - 0.1
			size = ((available - 0.5) / limitPrice).toFixed(8)
			console.log('size:', size)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.buy(authedClient, args).then( () => {
			action = 'panic buy'
			console.log('**** PANIC BUY ****')
		}).catch( err => {
			console.log("ERROR[PANIC buy]:".red, err)
		})
	}).catch(err => {
		console.log("ERROR[PANIC getCurrencyCapital]:".red, err)
	})
}

a.panicSell = function(authedClient, assetAccountID, lastTradePrice, selector) {
	a.getAssetCapital(authedClient, assetAccountID).then( res => {
		let available = parseFloat(res.available)
			limitPrice = lastTradePrice + 0.1
			size = (available - 0.001).toFixed(8)
			args = {
				price: limitPrice.toString(), 
				size: size.toString(), 
				product_id: selector,
				post_only: true
			}
		a.sell(authedClient, args).then( () => {
			action = 'panic sell'
			console.log('**** PANIC SELL ****')
		}).catch( err => {
			console.log("ERROR[PANIC buy]:".red, err)
		})
	}).catch(err => {
		console.log("ERROR[PANIC getAssetCapital]:".red, err)
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