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
    timeSlice = 60 /* 1 min */
    timeRange = 6 /* 6 mins */

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
        /* EXECUTE every 30 seconds */
        let jobScheduler = schedule.scheduleJob('*/30 * * * * *', function(){
            console.log("STARTING BALANCE:".green, startAssetCapital.gray, asset.gray, '---', startCurrencyCapital.gray, currency.gray, '--->', startTotal.yellow, currency.yellow)
            a.calculateSpeed(c.publicClient, timeSlice, timeRange).then( res => {
              let AVG_SPEED = parseFloat(res)
              t.trade(c.authedClient, c.publicClient, assetAccountID, currencyAccountID, c.selector, startTotal, AVG_SPEED);
            }).catch(err => {
              console.log("ERROR[calculateSpeed]:".red, err)
            })
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
