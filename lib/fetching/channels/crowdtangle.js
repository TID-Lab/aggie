const path = require('path');
const { readFile } = require('fs').promises;
const { builtin } = require('downstream');
const hash = require('../../hash');

const { CrowdTangleChannel } = builtin;

/**
 * A CrowdTangleChannel that toggles between pulling
 * posts in from the Lists and Saved Searches of a CrowdTangle dashboard.
 */
class AggieCrowdTangleChannel extends CrowdTangleChannel {
    constructor(options) {
        super(options);

        this.savedSearchToggle = false;
        this.hashedToken = hash(this.dashboardToken);
    }

    /**
     * Reads the pair of Saved Search & List lists associated with
     * this AggieCrowdTangleChannel from the `crowdtangle_list.json` file.
     */
    async readListPair() {
        const filePath = path.resolve(__dirname + '../../../../config/crowdtangle_list.json');
        let listPairs;
        try {
            const fileContents = await readFile(filePath, { encoding: 'utf8' });
            listPairs = JSON.parse(fileContents);
        } catch (err) {
            listPairs = {};
        }
        
        // lists are stored with hashes for security
        const listPair = listPairs[this.hashedToken];
        if (typeof listPair === 'object') {
            return listPair;
        }
        return {
            crowdtangle_list_account_pairs: {},
            crowdtangle_saved_searches: {},
        };
    }

    /**
     * Returns whether any of the given set of words are found
     * within the given post fetched from CrowdTangle.
     */
    doesPostMatchWords(post, words) {
        const { content, raw } = post;
        const regex = new RegExp(words.join("|"), 'gi');
        if (
            words.length
            && (
                regex.test(content)
                || regex.test(raw.caption)
                || regex.test(raw.title)
                || regex.test(raw.description)
                || regex.test(raw.imageText)
            )
        ) {
            return true;
        }
        return false;
    }

    /**
     * Annotates a post with the CrowdTangle List or Saved Search from whence it came.
     */
    addCrowdTangleTags(post) {
        let crowdtangleTags;
        const {
            crowdtangle_saved_searches: savedSearches,
            crowdtangle_list_account_pairs: listAccountPairs
        } = this.listPair;

        const { raw } = post;
        const accountId = raw.account.id;
    
        if (listAccountPairs[accountId]) {
            crowdtangleTags = listAccountPairs[accountId];
        } else if (this.savedSearchToggle) {
            crowdtangleTags = [];

            // This is a workaround to identify possible saved search names associated with a post using substring search.
		    // We plan to remove this workaround when CT adds list IDs/account IDs to saved search API responses.
            for (const savedSearchId in savedSearches) {
                const savedSearch = savedSearches[savedSearchId];
                const doesMatch = this.doesPostMatchWords(post, savedSearch.words);
                if (doesMatch) crowdtangleTags.push(savedSearch.name);
            }

            // if no matches are found, then add default "Saved Search" tag.
            if (crowdtangleTags.length === 0) {
                crowdtangleTags.push('Saved Search');
            }
        } else {
            // If the list is not found and not matched, make the ct_tag the account.id so we can identify it later.
            crowdtangleTags = accountId;
        }

        raw.crowdtangleTags = crowdtangleTags;
    }

    /**
     * Overrides the CrowdTangleChannel `fetchPage` function.
     */
    async fetchPage() {
        this.listPair = await this.readListPair();
        const { crowdtangle_saved_searches: savedSearches } = this.listPair;

        const savedSearchIds = Object.keys(savedSearches).join(",");

        if (this.savedSearchToggle) {
            this.queryParams = {
                ...this.queryParams,
                listIds: savedSearchIds, // Saved Searches
            };
        } else {
            this.queryParams = {
                ...this.queryParams,
                listIds: undefined, // Lists
            };
        }

        const posts = await super.fetchPage();
        posts.forEach((post) => this.addCrowdTangleTags(post));

        this.savedSearchToggle = !this.savedSearchToggle;

        return posts;
    }
}

module.exports = AggieCrowdTangleChannel;