let t = module.exports = {}
	a = require('./actions')

let lastTradeTime, lastTradePrice, lastFill, lastFillPrice,
    lowest, highest, action,
    currentAssetCapital, currentCurrencyCapital,
    panic = false

t.trade = function(authedClient, publicClient, assetAccountID, currencyAccountID, selector) {
  /* Get last trade price*/
  a.getLastTrade(publicClient).then(res => {
    lastTradeTime = moment(res.time).format('DD-MM-YYYY HH:mm:ss')
    lastTradePrice = parseFloat(res.price)
  }).catch(err => {
    console.log("ERROR[getLastTradePrice]:".red, err)
  })
  /* Get last filled order */
  .then( () => {
  	a.getLastFill(authedClient).then( res => {
  		lastFill = res
  		/* Get open orders */
		a.getOrders(authedClient).then( orders => {
			/* if there's an open order */
			/* check for PANIC */
			if(orders.length > 0){
				let order = orders[0]
				lastFillPrice = parseFloat(lastFill.price)
				if(lastFill.side !== 'buy') {
					if( !panic && typeof(PANIC) == 'number' && lastTradePrice > lastFillPrice + PANIC){
						a.cancelOrders(authedClient).then( () => {
							a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
								let available = parseFloat(res.available)
									limitPrice = lastTradePrice - 10
									size = ((available - 0.5) / limitPrice).toFixed(8)
									args = {
										price: limitPrice.toString(), 
										size: size.toString(), 
										product_id: selector,
										post_only: true
									}
								a.buy(authedClient, args)
								panic = true;
								console.log('**** PANIC BUY ****')
							}).catch(err => {
					    		console.log("ERROR[PANIC getCurrencyCapital]:".red, err)
					  		})
						}).catch(err => {
					    	console.log("ERROR[PANIC cancelOrders]:".red, err)
					  	})
					}
				}
				if(lastFill.side !== 'sell') {
					if( !panic && typeof(PANIC) == 'number' && lastTradePrice < lastFillPrice - PANIC ){
						a.cancelOrders(authedClient).then( () => {
							a.getAssetCapital(authedClient, assetAccountID).then( res => {
								let available = parseFloat(res.available)
									limitPrice = lastTradePrice + 10
									size = (available - 0.001).toFixed(8)
									args = {
										price: limitPrice.toString(), 
										size: size.toString(), 
										product_id: selector,
										post_only: true
									}
								a.sell(authedClient, args)
								panic = true;
								console.log('**** PANIC SELL ****')
							}).catch(err => {
					    		console.log("ERROR[PANIC getAssetCapital]:".red, err)
					  		})
						}).catch(err => {
					    	console.log("ERROR[PANIC cancelOrders]:".red, err)
					  	})
					}
				}
			}
			/* Else if there's no open orders place one */
			else {
				if(lastFill.side !== 'buy'){
					if(lowest == undefined) {
					 	lowest = lastTradePrice
					}
					if(lastTradePrice < lowest) {
					 	lowest = lastTradePrice
					}
					lastFillPrice = parseFloat(lastFill.price)
					action = 'wait'
					console.log('low: ', lastTradePrice, 'lowest: ', lowest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice - MARGIN))
					if(lastTradePrice > lowest + DROP && lastTradePrice < lastFillPrice - MARGIN) {
					 	highest = lastTradePrice
			 			a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
			 				let available = parseFloat(res.available)
			 					limitPrice = lastTradePrice - 0.1
			 					size = ((available - 0.5) / limitPrice).toFixed(8)
			 					args = {
			 						price: limitPrice.toString(), 
			 						size: size.toString(), 
			 						product_id: selector,
			 						post_only: true
			 					}
			 				a.buy(authedClient, args)
			 				panic = true
			 				action = 'buy'
			 				console.log('**** BUY order placed ****')
			 			}).catch(err => {
			 	    		console.log("ERROR[BUY getCurrencyCapital]:".red, err)
			 	  		})
					}
				}
				if(lastFill.side !== 'sell') {
					if(highest == undefined) {
				    	highest = lastTradePrice
				  	} 
				 	if(lastTradePrice > highest) {
				    	highest = lastTradePrice
				  	}
				  	lastFillPrice = parseFloat(lastFill.price)
				  	action = 'wait'
				  	console.log('high: ', lastTradePrice, 'highest: ', highest, 'lastFillPrice: ', lastFillPrice, 'goal: ', (lastFillPrice + MARGIN))
				  	if(lastTradePrice < highest - DROP && lastTradePrice > lastFillPrice + MARGIN) {
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
		    				console.log('**** SELL order placed ****')
		    			}).catch(err => {
		    	    		console.log("ERROR[SELL getAssetCapital]:".red, err)
		    	  		})
				  	}
				}
			}
		}).catch(err => {
	 		 console.log("ERROR[getOrders]:".red, err)
		})
		.then( () => {
			a.getAssetCapital(authedClient, assetAccountID).then(res => {
				currentAssetCapital = parseFloat(res.balance).toFixed(5)
			}).catch(err => {
			  console.log("ERROR[Logging: getAssetCapital]:".red, err)
			})
			.then( () => {
				a.getCurrencyCapital(authedClient, currencyAccountID).then( res => {
					currentCurrencyCapital = parseFloat(res.balance).toFixed(2)
					console.log(lastTradeTime.grey, lastTradePrice.toFixed(2).cyan, action.magenta)
					console.log('CURRENT BALANCE'.green, currentAssetCapital.gray, 'BTC'.gray, '---',currentCurrencyCapital.gray, 'EUR'.gray)
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
  	}).catch(err => {
    	console.log("ERROR[getLastFill]:".red, err)
  	})
  }).catch(err => {
    console.log("ERROR[getLastFillWrap]:".red, err)
  })
}