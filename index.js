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
    
    MARGIN = 2
    DROP = 0.5
    PANIC = 40
    RETRY = 10


/* EXECUTE ONLY ONCE: Get Account balances */
a.getAccountsIDs(c.authedClient, c.selector).then( res => {
  assetAccountID = res[0]
  currencyAccountID = res[1]
  /* Get asset capital */
  a.getAssetCapital(c.authedClient, assetAccountID).then( res => {
    startAssetCapital = parseFloat(res.balance).toFixed(5)
    /* Get currency capital */
    a.getCurrencyCapital(c.authedClient, currencyAccountID).then( res => {
      startCurrencyCapital = parseFloat(res.balance).toFixed(2)
      /* Get last trade price*/
      a.getLastTrade(c.publicClient).then(res => {
        lastTradePrice = parseFloat(res.price)
        startTotal = parseFloat((parseFloat(startAssetCapital) * lastTradePrice) + parseFloat(startCurrencyCapital)).toFixed(2)
        /* EXECUTE every 5 minutes */
        let jobScheduler = schedule.scheduleJob('*/5 * * * *', function(){
            console.log("STARTING BALANCE:".green, startAssetCapital.gray, asset.gray, '---', startCurrencyCapital.gray, currency.gray, '--->', startTotal.yellow, currency.yellow)
            t.trade(c.authedClient, c.publicClient, assetAccountID, currencyAccountID, c.selector, startTotal);
        });
      }).catch(err => {
        console.log("ERROR[getLastTradePrice]:".red, err)
      })
    }).catch(err => {
      console.log("ERROR[getCurrencyCapital]:".red, err)
    })
  }).catch(err => {
    console.log("ERROR[getAssetCapital]:".red, err)
  })
}).catch(err => {
  console.log("ERROR[getAccountsIDs]:".red, err)
})
