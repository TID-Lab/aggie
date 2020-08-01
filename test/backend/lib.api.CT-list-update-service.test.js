var utils = require('./init');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var CTListUpdateService = require('../../lib/api/CT-list-update-service');

// Stubs the _httpRequest method of the content service to return the data in the given fixture file.
function stubWithFixture(fixtureFile, service) {
  // fixture to write all output to
  var outputFixtureFile = path.join('../../test', 'backend', 'fixtures', 'ct-list-output.json');
  // If service is null, creates a CrowdTangleContentService
  service = service || new CTListUpdateService({directory: outputFixtureFile});

  // Make the stub function return the expected args (err, res, body).
  fixtureFile = path.join('test', 'backend', 'fixtures', fixtureFile);
  service._httpRequest = async function(params) {
    if (params.fixtureUrl) {
      fixtureFile = path.resolve(__dirname, `../../test/backend/fixtures/${params.fixtureUrl}.json`);
    }
    return fs.readFileSync(fixtureFile).toString();
  };

  service._parseList = function(listResponse) {
    // Builds an Object for each list and returns array of CT list information
    return listResponse.map(list => {
      var idString = String(list.id);
      var title = String(list.title);
      var list = {};
      list.metadata = {
        list_id: idString,
        title: title,
      }
      list.accountOptions = {
        fixtureUrl: idString
      };
      return list
    });
  };
  return service;
}

describe('CrowdTangle list update service', function() {
  it('should instantiate correct CrowdTangle list update service', function() {
    var service = new CTListUpdateService({directory: '/'});
    expect(service).to.be.instanceOf(CTListUpdateService);
  });

  it('should fetch empty lists', function(done) {
    var service = stubWithFixture('ct-list-0.json');
    service._fetchLists().then(function(data) {
      expect(service._listResponse).to.be.equal(undefined);
      done();
    })
    .catch(function(err) {
      done(err);
    })
  });

  it('should fetch lists from CrowdTangle', function(done) {
    var service = stubWithFixture('ct-list-1.json');
    service._fetchLists().then(function(data) {
      // console.log(JSON.parse(fs.readFileSync(path.join('test', 'backend', 'fixtures', 'ct-list-1.json'))).result.lists);
      expect(service._listResponse).to.contain({"id": "ct-list-account-0", "title": "list0", "type": "LIST"});
      expect(service._listResponse).to.contain({"id": "ct-list-account-1", "title": "list1", "type": "LIST"});
      done();
    })
    .catch(function(err) {
      done(err);
    })
  });

  it('should parse lists from CrowdTangle', function(done) {
    var service = stubWithFixture('ct-list-1.json');
    service._fetchLists().then(function(data) {
      // console.log(JSON.parse(fs.readFileSync(path.join('test', 'backend', 'fixtures', 'ct-list-1.json'))).result.lists);
      expect(service._listResponse).to.contain({"id": "ct-list-account-0", "title": "list0", "type": "LIST"});
      expect(service._listResponse).to.contain({"id": "ct-list-account-1", "title": "list1", "type": "LIST"});
      done();
    })
    .catch(function(err) {
      done(err);
    })
  });

  it('should fetch and update empty content', function(done) {
    var service = stubWithFixture('ct-list-0.json');
    service._updateCTList().then(function(data) {
      fs.readFile(path.join('test', 'backend', 'fixtures', 'ct-list-output.json'), function(err,file) {
        output = JSON.parse(file);
        expect(output).to.have.keys("crowdtangle_list_account_pairs");
        expect(output.crowdtangle_list_account_pairs).to.be.empty;
        done();
      });
    })
    .catch(function(err) {
      done(err);
    })
  });

  it('should fetch and update lists', function(done) {
    var service = stubWithFixture('ct-list-1.json');
    service._updateCTList().then(function(data) {
      fs.readFile(path.join('test', 'backend', 'fixtures', 'ct-list-output.json'), function(err,file) {
        output = JSON.parse(file);
        expect(output).to.have.keys("crowdtangle_list_account_pairs");
        expect(output.crowdtangle_list_account_pairs).to.contain({
          "0": "list0",
          "1": "list0",
          "2": "list1",
          "3": "list1"
        });
        done();
      });
    })
    .catch(function(err) {
      done(err);
    })
  });

  after(function(done) {
    fs.writeFileSync(path.join('test', 'backend', 'fixtures', 'ct-list-output.json'), JSON.stringify({}))
    done();
  });
});
