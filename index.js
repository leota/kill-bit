let schedule = require('node-schedule')
    colors = require('colors')
    moment = require('moment')
    c = require('./lib/client')
    a = require('./lib/actions')
    t = require('./lib/trade')

/* GLOBAL VARIABLES */
let assetAccountID, currencyAccountID, startAssetCapital, startCurrencyCapital, lastTradePrice, startTotal,
    asset = c.selector.split('-')[0]
    currency = c.selector.split('-')[1]
    PANIC = 60
    MARGIN = 8
    DROP = 1

/* EXECUTE ONLY ONCE: Get Account balances */
a.getAccountsIDs(c.authedClient, c.selector).then( res => {
  assetAccountID = res[0]
  currencyAccountID = res[1]
  return true
}).catch(err => {
  console.log("ERROR[getAccountsIDs]:".red, err)
})
.then( () => {
  a.getAssetCapital(c.authedClient, assetAccountID).then( res => {
    startAssetCapital = parseFloat(res.balance).toFixed(5)
    return true
  }).catch(err => {
    console.log("ERROR[getAssetCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getAssetCapitalWrap]:".red, err)
})
.then( () => {
  a.getCurrencyCapital(c.authedClient, currencyAccountID).then( res => {
    startCurrencyCapital = parseFloat(res.balance).toFixed(2)
    return true
  }).catch(err => {
    console.log("ERROR[getCurrencyCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getCurrencyCapitalWrap]:".red, err)
})
.then( () => {
  /* Get last trade price*/
  a.getLastTrade(c.publicClient).then(res => {
    lastTradePrice = parseFloat(res.price)
    startTotal = parseFloat((parseFloat(startAssetCapital) * lastTradePrice) + parseFloat(startCurrencyCapital)).toFixed(2)
  }).catch(err => {
    console.log("ERROR[getLastTradePrice]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getLastTradePriceWrap]:".red, err)
})
.then(() => {
    /* EXECUTE every 10 seconds */
   let jobScheduler = schedule.scheduleJob('*/10 * * * * *', function(){
      console.log("STARTING BALANCE:".green, startAssetCapital.gray, asset.gray, '---', startCurrencyCapital.gray, currency.gray, '--->', startTotal.yellow, currency.yellow)
      t.trade(c.authedClient, c.publicClient, assetAccountID, currencyAccountID, c.selector, startTotal);
  });
})