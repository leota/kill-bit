let a = module.exports = {}

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