let t = module.exports = {}
a = require('./actions')

let lastTradeTime, lastTradePrice, lastFill, lastFillPrice,
    lowest, highest,
    currentAssetCapital, currentCurrencyCapital,
    currentTotal
	action = 'wait'

t.trade = function(authedClient, publicClient, assetAccountID, currencyAccountID, selector, startTotal) {
    asset = selector.split('-')[0]
    currency = selector.split('-')[1]
    /* Cancel current orders */
    a.cancelOrders(authedClient).then( () => {
    }).catch(err => {
    	console.log("ERROR[cancelOrders]:".red, err)
  	})
  	/* Get last trade price */
  	.then(() => {
  		a.getLastTrade(publicClient).then(res => {
  		    lastTradeTime = moment(res.time).format('DD-MM-YYYY HH:mm:ss')
  		    lastTradePrice = parseFloat(res.price)
  		    /* Get last filled order */
  		    a.getLastFill(authedClient).then(res => {
  		        lastFill = res
  		        lastFillPrice = parseFloat(lastFill.price)
  		        action = 'wait'
  		        if (lastFill.side !== 'buy') {
  		            if (lowest == undefined) {
  		                lowest = lastTradePrice
  		            }
  		            if (lastTradePrice < lowest) {
  		                lowest = lastTradePrice
  		            }
  		            /* PROFIT BUY */
  		            if (lastTradePrice > lowest + DROP && lastTradePrice < lastFillPrice - MARGIN) {
  		                a.profitBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		            }
  		            /* RETRY SELL */
  		            if (typeof(RETRY) == 'number' && lastTradePrice > lastFillPrice + RETRY && lastTradePrice < lastFillPrice + PANIC) {
  		                a.retrySell(authedClient, assetAccountID, lastTradePrice, selector)
  		            }
  		            /* PANIC BUY */
  		            if (typeof(PANIC) == 'number' && lastTradePrice > lastFillPrice + PANIC) {
  		                a.panicBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		            }
  		            console.log('low: ', lastTradePrice, 'lowest: ', lowest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice - MARGIN))
  		        }
  		        if (lastFill.side !== 'sell') {
  		            if (highest == undefined) {
  		                highest = lastTradePrice
  		            }
  		            if (lastTradePrice > highest) {
  		                highest = lastTradePrice
  		            }
  		            /* PROFIT SELL */
  		            if (lastTradePrice < highest - DROP && lastTradePrice > lastFillPrice + MARGIN) {
  		                a.profitSell(authedClient, assetAccountID, lastTradePrice, selector)
  		            }
  		            /* RETRY BUY */
  		            if (typeof(RETRY) == 'number' && lastTradePrice > lastFillPrice + RETRY && lastTradePrice > lastFillPrice - PANIC) {
  		                a.retryBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		            }
  		            /* PANIC SELL */
  		            if (typeof(PANIC) == 'number' && lastTradePrice < lastFillPrice - PANIC) {
  		                a.panicSell(authedClient, assetAccountID, lastTradePrice, selector)
  		            }
  		            console.log('high: ', lastTradePrice, 'highest: ', highest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice + MARGIN))
  		        }
  		    }).catch(err => {
  		        console.log("ERROR[getLastFill]:".red, err)
  		    })
  		}).catch(err => {
  		    console.log("ERROR[getLastTradePrice]:".red, err)
  		})
  	}).catch(err => {
  		console.log("ERROR[getLastTradePriceWrap]:".red, err)
  	})
    .then(() => {
        a.getAssetCapital(authedClient, assetAccountID).then(res => {
                currentAssetCapital = parseFloat(res.balance).toFixed(5)
            }).catch(err => {
                console.log("ERROR[Logging: getAssetCapital]:".red, err)
            })
            .then(() => {
                a.getCurrencyCapital(authedClient, currencyAccountID).then(res => {
                    currentCurrencyCapital = parseFloat(res.balance).toFixed(2)
                    currentTotal = parseFloat((parseFloat(currentAssetCapital) * lastTradePrice) + parseFloat(currentCurrencyCapital)).toFixed(2)
                    // let increment = (parseFloat(currentTotal) - parseFloat(startTotal))/(parseFloat(startTotal) * 100)
                    console.log(lastTradeTime.grey, lastTradePrice.toFixed(2).cyan, action.magenta, currentAssetCapital.gray, asset.gray, '---', currentCurrencyCapital.gray, currency.gray, '--->', currentTotal.yellow, currency.yellow)
                }).catch(err => {
                    console.log("ERROR[Logging: getCurrencyCapital]:".red, err)
                })
            })
            .catch(err => {
                console.log("ERROR[Logging: getCurrencyCapitalWrap]:".red, err)
            })
    }).catch(err => {
        console.log("ERROR[Logging]:".red, err)
    })
}