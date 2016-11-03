  var sendRequest = function(requestParams) {
    var defer = promise.defer();
    request('http://localhost:1111')
    .get('/smsghana')
    .query(requestParams)
    .expect(200)
    .end(function(err, res) {
      if (err) return defer.fulfill(err);
      defer.fulfill(res);
    });
    return defer;
  };
