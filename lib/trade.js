let t = module.exports = {}
	a = require('./actions')

t.trade = function(authedClient, publicClient, assetAccountID, currencyAccountID) {
  /* Get last trade price*/
  a.getLastTrade(publicClient).then(res => {
    lastTradeTime = moment(res.time).format('DD-MM-YYYY HH:mm:ss')
    lastTradePrice = parseFloat(res.price)
    console.log(lastTradeTime.grey, lastTradePrice.toFixed(2).cyan)
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
				if(lastFill.side !== 'sell') {
					if( typeof(PANIC) == 'number' && lastTradePrice < lastFillPrice - PANIC){
						console.log('**** PANIC SELL****')
					}
				}
				if(lastFill.side !== 'buy') {
					if( typeof(PANIC) == 'number' && lastTradePrice > lastFillPrice + PANIC){
						console.log('**** PANIC BUY ****')
					}
				}
			}
		}).catch(err => {
	 		 console.log("ERROR[getOrders]:".red, err)
		})
  	}).catch(err => {
    	console.log("ERROR[getLastFill]:".red, err)
  	})
  }).catch(err => {
    console.log("ERROR[getLastFillWrap]:".red, err)
  })
}