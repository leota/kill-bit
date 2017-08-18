let a = module.exports = {}

a.getAccountsIDs = function(authedClient, selector) {
	return new Promise((resolve, reject) =>{
		authedClient.getAccounts(function(err, response, data) {
		  if (err) {
		    return reject(err)
		  }
		  // Get Asset and Currency accounts IDs
		  let asset = selector.split('-')[0]
		  currency = selector.split('-')[1]
		  for( let i = 0; i < data.length; i++) {
		  	if(data[i].currency == asset) {
		  		assetAccoundID = data[i].id;
		  	}
		  	if(data[i].currency == currency) {
		  		currencyAccountID = data[i].id;
		  	}
		  }
		  let accountsIDs = [assetAccoundID, currencyAccountID]
		  return resolve(accountsIDs)
		});
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

a.getAssetCapital = function(authedClient,  assetAccountID) {
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