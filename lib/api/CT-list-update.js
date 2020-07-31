var request = require('request-promise');
var config = require('../../config/secrets');
var path = require('path');
var fs = require('fs');
var headers = {
    'x-api-token': config.get().crowdtangle.apiToken,
    'Cache-Control': 'no-cache'
};
var options = {
    'method': 'GET',
    'url': 'https://api.crowdtangle.com/lists',
    'headers': headers 
};

async function updateCTList(directory) {
    var response = await request(options);
    // parse response for list ids and title
    var listResponse = JSON.parse(response).result.lists;

    // build array of objects with list information
    var lists = parseList(listResponse);

    // request for accounts 
    var content = { "crowdtangle_list_account_pairs": {} };
    while (lists.length !== 0) {
        var list = lists.shift();
        var accountOptions = {
            'method': 'GET',
            'url': list.url,
            'headers': headers
        };
        console.log("Current Request: " + accountOptions.url); //for debugging
        // gets the request
        var response =  await request(accountOptions);
        // checks for pagination and adds to list if it exists
        var paginationResponse = JSON.parse(response).result.pagination;
        if (paginationResponse && paginationResponse.nextPage) {
            // console.log(paginationResponse.nextPage);
            lists.push({
                list_id: list.list_id,
                title: list.title,
                url: paginationResponse.nextPage
            })
        }
        var accountResponse = JSON.parse(response).result.accounts;
        accountResponse.forEach(account => {
            content.crowdtangle_list_account_pairs[account.id] = list.title;
        });
    };
    // writes to JSON
    writeFile(content, directory); 
    return content;
}

function parseList(listResponse) {
    // Builds an Object for each list and returns array of CT list information
    return listResponse.map(list => {
        var idString = String(list.id);
        var title = String(list.title);
        return {
            list_id: idString,
            title: title,
            url: `https://api.crowdtangle.com/lists/${idString}/accounts`
        };
    });
}

function writeFile(content, directory) {
    // Writes input Object into json file
    fs.writeFile(path.resolve(__dirname, directory), JSON.stringify(content, null, '\t'), function (err) {
        if (err)
            throw err;
    });
}
module.exports = updateCTList;