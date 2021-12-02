var request = require('request-promise');
var path = require('path');
var fs = require('fs');
var hash = require('../hash');
var Credentials = require('../../models/credentials');

var CTListUpdateService = function() {
    this._headers = {
        'Cache-Control': 'no-cache'
    }
    this._listResponse = [];
}
CTListUpdateService.prototype.OUTPUT_DIR = '../../config/crowdtangle_list.json';

CTListUpdateService.prototype._updateCTLists = async function() {
    var credentials = await Credentials.find({ type: 'crowdtangle' }).exec();

    var lists = {};
    credentials.forEach((c) => lists[c.secrets.dashboardAPIToken] = true);
    Object.keys(lists).forEach((token) => {
        delete lists[token];
        lists[hash(token)] = token;
    });

    let oldLists;
    try {
        var content_raw = fs.readFileSync(path.resolve(__dirname, this.OUTPUT_DIR));
        oldLists = JSON.parse(content_raw);
    } catch (_) {
        oldLists = {};
    }

    const hashes = Object.keys(lists);
    for (let i = 0; i < hashes.length; i += 1) {
        const hash = hashes[i];
        const token = lists[hash];
        
        this._apiToken = token;
        const content = await this._updateCTList(oldLists[hash]);

        lists[hash] = content;
    }

    // writes to JSON
    this._writeFile(lists);

    return lists;
}

CTListUpdateService.prototype._updateCTList = async function(c) {
    var content = c || {
        crowdtangle_list_account_pairs: {},
	    crowdtangle_saved_searches: {}
    };

    this._listResponse = await this._fetchLists();
    if (this._listResponse) {
        // build array of objects with list information
        var parsedListResponse = this._parseList(this._listResponse);
        var lists = parsedListResponse.lists;
        var savedSearches = parsedListResponse.savedSearches;
        // request for accounts
        while (lists.length !== 0) {
            var list = lists.shift();
            var response = await this._httpRequest(list.accountOptions);
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
                if(!(account.id in content.crowdtangle_list_account_pairs)){
                    content.crowdtangle_list_account_pairs[account.id] = [list.metadata.title];
                }
                else {
                    if (content.crowdtangle_list_account_pairs[account.id].indexOf(list.metadata.title) === -1){
                        content.crowdtangle_list_account_pairs[account.id].push(list.metadata.title);
                    }
                }
            });
        }
        //deleting saved searches from the crowdtangle_list.json that are not on the dashboard anymore
        Object.keys(content.crowdtangle_saved_searches).forEach(function(savedSearch) {
            if (!(savedSearches.map(obj => obj.list_id.toString()).includes(savedSearch))){
                delete content.crowdtangle_saved_searches[savedSearch];
        }})
        //adding new saved searches from the dashboard to the file. Retain the existing ones. 
        while(savedSearches.length !== 0) {
            var savedSearch = savedSearches.shift();
            if(!(savedSearch.list_id in content.crowdtangle_saved_searches)){
                content.crowdtangle_saved_searches[savedSearch.list_id] = {"name" : savedSearch.title, "words": []};
            }

        }
    }
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
                'headers': {
                    ...this._headers,
                    'x-api-token': this._apiToken,
                },
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
    fs.writeFileSync(path.resolve(__dirname, this.OUTPUT_DIR), JSON.stringify(content, null, '\t'), function (err) {
        if (err)
            throw err;
    });
}

CTListUpdateService.prototype._httpRequest = async function (params) {
    console.log("Fetching", params.url);
    return request(params);
}

CTListUpdateService.prototype._fetchLists = async function () {
    var options = {
        'method': 'GET',
        'url': 'https://api.crowdtangle.com/lists',
        'headers': {
            ...this._headers,
            'x-api-token': this._apiToken,
        }
    };
    var response = await this._httpRequest(options);
    // parse response for list ids and title
    return JSON.parse(response).result.lists;
}

module.exports = CTListUpdateService;
