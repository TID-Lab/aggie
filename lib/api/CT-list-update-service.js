var request = require('request-promise');
var config = require('../../config/secrets');
var path = require('path');
var fs = require('fs');

var CTListUpdateService = function() {
    this._headers = {
        'x-api-token': config.get().crowdtangle.apiToken,
        'Cache-Control': 'no-cache'
    }
    this._apiToken = config.get().crowdtangle.apiToken;
    this._listResponse = [];
}

CTListUpdateService.prototype.OUTPUT_DIR = '../../config/crowdtangle_list.json';

CTListUpdateService.prototype._updateCTList = async function() {
    var content = { "crowdtangle_list_account_pairs": {}, "crowdtangle_saved_searches" : {}};
    await this._fetchLists();
    if (this._listResponse) {
        // build array of objects with list information
        var parsedListResponse = this._parseList(this._listResponse);
        var lists = parsedListResponse.lists;
        var savedSearches = parsedListResponse.savedSearches;
        // request for accounts 
        while (lists.length !== 0) {
            var list = lists.shift();
            // console.log("Current Request: " + JSON.stringify(list.accountOptions.url)); //for debugging
            // gets the request
            var response =  await this._httpRequest(list.accountOptions);
            // checks for pagination and adds to list if it exists
            var paginationResponse = JSON.parse(response).result.pagination;
            if (paginationResponse && paginationResponse.nextPage) {
                // console.log(paginationResponse.nextPage);
                var newList = {};
                newList.metadata = {
                    list_id: list.metadata.list_id,
                    title: list.metadata.title,
                };
                newList.accountOptions = {
                    'method': 'GET',
                    'headers': this._headers,
                    'url': paginationResponse.nextPage
                };
                lists.push(newList);
            }
            // console.log(JSON.parse(response));
            var accountResponse = JSON.parse(response).result.accounts;
            accountResponse.forEach(account => {
                content.crowdtangle_list_account_pairs[account.id] = list.metadata.title;
            });
        };
        
        while(savedSearches.length !== 0) {
            var savedSearch = savedSearches.shift();
            content.crowdtangle_saved_searches[savedSearch.list_id] = savedSearch.title;
        }
    }
    // writes to JSON
    this._writeFile(content); 
    return content;
}
CTListUpdateService.prototype._parseList = function (fetchedListsResponse) {
    // Builds an Object for each list and returns array of CT list information
    var listResponse = fetchedListsResponse.filter(listResponse => listResponse.type == "LIST");
    var savedSearchResponse = fetchedListsResponse.filter(listResponse => listResponse.type == "SAVED_SEARCH");
    return {
        "lists" : listResponse.map(listResponse => {
            var idString = String(listResponse.id);
            var title = String(listResponse.title);
            var list = {};
            list.metadata = {
                list_id: idString,
                title: title,
            }
            list.accountOptions = {
                'method': 'GET',
                'headers': this._headers,
                'url': `https://api.crowdtangle.com/lists/${idString}/accounts`
            };
            return list;
        }),
        "savedSearches" : savedSearchResponse.map(savedSearchResponse => {
            return {
                list_id: savedSearchResponse.id,
                title: String(savedSearchResponse.title)
            }
        })
    
    };
}

CTListUpdateService.prototype._writeFile = function (content) {
    // Writes input Object into json file
    fs.writeFileSync(path.resolve(__dirname, this._outputDir), JSON.stringify(content, null, '\t'), function (err) {
        if (err)
            throw err;
    });
}

CTListUpdateService.prototype._httpRequest = async function (params) {
    return request(params);
}

CTListUpdateService.prototype._fetchLists = async function () {
    var options = {
        'method': 'GET',
        'url': 'https://api.crowdtangle.com/lists',
        'headers': this._headers 
    };
    var response = await this._httpRequest(options);
    // parse response for list ids and title
    this._listResponse = JSON.parse(response).result.lists;
}

module.exports = CTListUpdateService;