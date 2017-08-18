let t = module.exports = {}
	a = require('./actions')

t.trade = function(authedClient, publicClient, assetAccountID, currencyAccountID) {
  a.getLastTrade(publicClient).then(res => {
    lastTradeTime = moment(res.time).format('DD-MM-YYYY HH:mm:ss')
    lastTradePrice = parseFloat(res.price)
    console.log(lastTradeTime.grey, lastTradePrice.toFixed(2).cyan)
  }).catch(err => {
    console.log("ERROR[getLastTradePrice]:".red, err)
  })
  .then( () => {
  	a.getLastFill(authedClient)
  }).catch(err => {
    console.log("ERROR[getLastFill]:".red, err)
  })
}