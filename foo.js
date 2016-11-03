  var sendRequest = function() {
    var defer = promise.defer();
    browser.sleep(500);
    browser.call(function() {
      request('http://localhost:1111')
        .get('/smsghana')
        .query(reqParams)
        .end(function(err, res) {
          if (err) defer.fulfill(err);
          defer.fulfill(res);
        });
    });
    return defer.promise;
  };
