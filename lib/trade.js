let t = module.exports = {}
a = require('./actions')

let lastTradeTime, lastTradePrice, lastFill, lastFillPrice,
    lowest, highest,
    currentAssetCapital, currentCurrencyCapital,
    currentTotal
	action = 'wait'

t.trade = function(authedClient, publicClient, assetAccountID, currencyAccountID, selector, startTotal, AVG_SPEED) {
   let 	asset = selector.split('-')[0]
	    currency = selector.split('-')[1]
	    MARGIN = parseFloat((AVG_SPEED + 0.1))
	    DROP = parseFloat((MARGIN / 3))
	    RETRY = parseFloat((MARGIN * 4))
	    PANIC = parseFloat((MARGIN * 12))
	console.log('AVG_SPEED:', AVG_SPEED)
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
  		        console.log('MARGIN:',MARGIN.toFixed(2), 'DROP:', DROP.toFixed(2), 'RETRY:', RETRY.toFixed(2), 'PANIC:', PANIC.toFixed(2))
  		        if (lastFill.side !== 'buy') {
  		            if (lowest == undefined) {
  		                lowest = lastTradePrice
  		            }
  		            if (lastTradePrice < lowest) {
  		                lowest = lastTradePrice
  		            }
  		            /* PROFIT BUY */
  		            if (lastTradePrice > lowest + DROP && lastTradePrice < lastFillPrice - MARGIN) {
  		                a.tryBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		                console.log('**** PROFIT BUY ****')
  		            }
  		            /* RETRY SELL */
  		            if (typeof(RETRY) == 'number' && lastTradePrice > lastFillPrice + RETRY && lastTradePrice < lastFillPrice + PANIC) {
  		                a.trySell(authedClient, assetAccountID, lastTradePrice, selector)
  		                console.log('**** RETRY SELL ****')
  		            }
  		            /* PANIC BUY */
  		            if (typeof(PANIC) == 'number' && lastTradePrice > lastFillPrice + PANIC) {
  		                a.tryBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		                console.log('**** PANIC BUY ****')
  		            }
  		            console.log('lowest: ', lowest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice - MARGIN))
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
  		                a.trySell(authedClient, assetAccountID, lastTradePrice, selector)
  		                console.log('**** PROFIT SELL ****')
  		            }
  		            /* RETRY BUY */
  		            if (typeof(RETRY) == 'number' && lastTradePrice < lastFillPrice - RETRY && lastTradePrice > lastFillPrice - PANIC) {
  		                a.tryBuy(authedClient, currencyAccountID, lastTradePrice, selector)
  		                console.log('**** RETRY BUY ****')
  		            }
  		            /* PANIC SELL */
  		            if (typeof(PANIC) == 'number' && lastTradePrice < lastFillPrice - PANIC) {
  		                a.trySell(authedClient, assetAccountID, lastTradePrice, selector)
  		                console.log('**** PANIC SELL ****')
  		            }
  		            console.log('highest: ', highest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice + MARGIN))
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