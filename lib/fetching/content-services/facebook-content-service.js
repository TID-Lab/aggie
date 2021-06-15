var CrowdTangleContentService = require('./crowdtangle-content-service');
var util = require('util');
var crowdtangle_lists = require('../../../config/crowdtangle_list');

//options.lastReportDate is passed here through the content-service-factory and will be utilised in calling the api, but its actually only maintained by the parent content service, it is only utilised by the child
var FacebookContentService = function(options) {
	CrowdTangleContentService.call(this, options);
}

util.inherits(FacebookContentService, CrowdTangleContentService);

FacebookContentService.prototype._parse = function(data, options) {
	var metadata = {
		sponsor: data.brandedContentSponsor	|| null,
		caption: data.caption || null,
		description: data.description || null, // this stores the content of sharedposts
		imageText: data.imageText || null,
		title: data.title || null,
		crowdtangleId: data.id || null,
		externalUrl: data.link || null,
		platform: data.platform || null,
		type: data.type || null,
		accountVerified: data.account ? data.account.verified : false,
		accountHandle: data.account ? data.account.handle : null,
		subscriberCount: data.account ? data.account.subscriberCount : 0,
		accountUrl: data.account ? data.account.url : null,
		mediaUrl: data.media? data.media.map(function(medium) {
			return {type: medium.type, url: medium.url}
		}) : null,
		actualStatistics: data.statistics.actual || null,
		expectedStatistics: data.statistics.expected || null,
		rawAPIResponse: data,
		hateSpeechScore: data.hateSpeechScore || null
	};

	var author = data.account ? data.account.name || data.account.handle : null;
	var content = data.message || 'No Content'

	// This code deals specifically with matching a crowdtangle list to a report's account id
	this.crowdtangle_lists = crowdtangle_lists.crowdtangle_list_account_pairs;
	this.crowdtangle_saved_searches = crowdtangle_lists.crowdtangle_saved_searches;
	// If the list is found and matched, then the ct_tag is the list name
	if (this.crowdtangle_lists[data.account.id]) {
		metadata.ct_tag = this.crowdtangle_lists[data.account.id];
	} else if (options.requestType == "SAVED_SEARCH") {
		metadata.ct_tag = []
		// This is a workaround to identify possible saved search names associated with a post using substring search.
		// We plan to remove this workaround when CT adds list IDs/account IDs to saved search API responses.
		for(var saved_search_id in this.crowdtangle_saved_searches){
			var saved_search = this.crowdtangle_saved_searches[saved_search_id];
			const doesMatch = this.doesReportMatchWords(saved_search.words, content, metadata)
			doesMatch && metadata.ct_tag.push(saved_search.name);
		}
		//if no matches are found, then add default "Saved Search" tag.
		if(metadata.ct_tag.length == 0){
			metadata.ct_tag.push("Saved Search");
		}
	}
	else {
		// If the list is not found and not matched, make the ct_tag the account.id so we can identify it later.
		metadata.ct_tag = data.account.id;
	}

	return {
	    authoredAt: new Date(data.date + " UTC") || new Date(),
	    fetchedAt: new Date(),
	    content: content,
	    author: author,
	    metadata: metadata,
	    url: data.postUrl,
	    //_sources: '', //need to get this info from somewhere
	    //_sourceNicknames: ''
  	};
}

//regex function used to check if words in saved searches match report data
FacebookContentService.prototype.doesReportMatchWords = function(words, content, metadata) {
	try{
		var regex = new RegExp(words.join("|"), 'gi');
		if (words.length &&
			(regex.test(content)||
			regex.test(metadata.caption) ||
			regex.test(metadata.title) ||
			regex.test(metadata.description)||
			regex.test(metadata.imageText))) {
				return true;
		}
	} catch (err) {
		console.error("Error creating regex for saved searches");
	}
	return false;
}

module.exports = FacebookContentService;
