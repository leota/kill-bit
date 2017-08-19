let schedule = require('node-schedule')
    colors = require('colors')
    moment = require('moment')
    c = require('./lib/client')
    a = require('./lib/actions')
    t = require('./lib/trade')

/* GLOBAL VARIABLES */
let assetAccountID, currencyAccountID, startAssetCapital, startCurrencyCapital,
    asset = c.selector.split('-')[0]
    currency = c.selector.split('-')[1]
    PANIC = 50
    MARGIN = 10
    DROP = 2

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
    console.log("STARTING BALANCE:".green, startAssetCapital.yellow, asset.yellow, '---', startCurrencyCapital.yellow, currency.yellow)
    return true
  }).catch(err => {
    console.log("ERROR[getCurrencyCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getCurrencyCapitalWrap]:".red, err)
}).then(() => {
   let jobScheduler = schedule.scheduleJob('*/10 * * * * *', function(){
      t.trade(c.authedClient, c.publicClient, assetAccountID, currencyAccountID, c.selector);
  });
})