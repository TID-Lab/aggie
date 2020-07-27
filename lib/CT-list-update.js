const request = require('request-promise');
const config = require('../config/secrets');

const headers = {
    'x-api-token': config.get().crowdtangle.dashboardAPIToken,
    'Cache-Control': 'no-cache'
};
const options = {
    'method': 'GET',
    'url': 'https://api.crowdtangle.com/lists',
    'headers': headers 
};
queryLists();
async function queryLists() {
    request(options, async function (error, response) {
        // parse response for list ids and title
        var listResponse = JSON.parse(response.body).result.lists;

        // build an Object for each list
        var lists = listResponse.map(list => {
            var idString = String(list.id);
            var title = String(list.title);
            return {
                list_id: idString,
                title: title,
                url: `https://api.crowdtangle.com/lists/${idString}/accounts`
            };
        });

        // request for accounts 
        var output = { "crowdtangle_list_account_pairs": {} };
        var size = 0; // counts accounts for debugging
        while (lists.length !== 0) {
            const list = lists.shift();
            var options = {
                'method': 'GET',
                'url': list.url,
                'headers': headers
            };
            console.log("Current Request: " + options.url);
            // gets the request
            const response =  await request(options);
            // checks for pagination and adds to list if it exists
            const paginationResponse = JSON.parse(response).result.pagination;
            if (paginationResponse && paginationResponse.nextPage) {
                // console.log(paginationResponse.nextPage);
                lists.push({
                    list_id: list.list_id,
                    title: list.title,
                    url: paginationResponse.nextPage
                })
            }
            const accountResponse = JSON.parse(response).result.accounts;
            accountResponse.forEach(account => {
                output.crowdtangle_list_account_pairs[account.id] = list.title;
                size++;
            });
        };
        console.log("Total Accounts: " + size);
    });
}

// TO DO: REFACTOR
// TO DO: CREATE JSON