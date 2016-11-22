'use strict';

var utils = require('./e2e-tools');
var expect = utils.expect;

describe('test generation of reports', function() {
  before(utils.initDb);
  after(utils.disconnectDropDb);

  beforeEach(utils.resetDb);
  beforeEach(utils.initAdmin.bind({}, 'asdfasdf'));
  beforeEach(function() {
    utils.addSource('SMS GH', { nickname: 'hello', keywords: 'test' });
  });
  afterEach(utils.deleteSource.bind({}, 'SMS GH', 'hello'));
  afterEach(utils.resetBrowser);

  var reqParams = {
    from: '9845098450',
    fulltext: 'loremipsumdolor',
    date: '2016-09-01',
    keyword: 'test'
  };

  var setAndExpect = function(fetchingOn, sourceOn, numExpect) {
    return function() {
      fetchingOn && utils.toggleFetching('On');
      !sourceOn && utils.toggleSource('SMS GH', 'Off');
      browser.sleep(500);
      browser.wait(utils.sendSmsghRequest(reqParams));
      browser.get(browser.baseUrl + 'reports');
      expect(utils.getReports().count()).to.eventually.equal(numExpect);
      fetchingOn && utils.toggleFetching('Off');
      sourceOn && utils.toggleSource('SMS GH', 'Off');
    };
  };

  it('with fetching:on and source:enabled',
     setAndExpect(true, true, 1));

  it('with fetching:on and source:disabled',
     setAndExpect(true, false, 0));

  it('wtih fetching:off and source:enabled',
     setAndExpect(false, true, 0));

  it('with fetching:off and source:disabled',
     setAndExpect(false, false, 0));

  it('with fetching toggled from on to off and source:disabled', function() {
    utils.toggleFetching('On');
    setAndExpect(false, false, 0)();
  });
});
