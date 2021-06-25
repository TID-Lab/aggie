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
     * Returns a list of the saved search ID's from the CrowdTangle dashboard.
     */
    async syncSavedSearches() {
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
            const savedSearches = listPair.crowdtangle_saved_searches;
            if (Array.isArray(savedSearches)) return savedSearches;
        }
        return [];
    }

    /**
     * Overrides the CrowdTangleChannel `fetchPage` function.
     */
    async fetchPage() {
        const savedSearchIds = await this.syncSavedSearches();

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
        this.savedSearchToggle = !this.savedSearchToggle;

        return super.fetchPage();
    }
}

module.exports = AggieCrowdTangleChannel;