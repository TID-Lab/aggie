let auth = require(__dirname + "/authentication.js");
let utils = require(__dirname + "/utils.js");
let config = require(__dirname + "../../config/config.json").powerBI;
const axios = require('axios')

class DatasetService {
  constructor() {
    this.headers;
    this.baseUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/datasets`;
  }

  async init() {
    let tokenResponse = null;
    try {
      tokenResponse = await auth.getAuthenticationToken();
    } catch (err) {
      return {
          "status": 401,
          "error": errorResponse
      };
    }
    this.headers = {
      "Authorization": utils.getAuthHeader(tokenResponse.accessToken)
    };
  }

  async getDatasets() {
    await this.init();
    const dataUrl = this.baseUrl;
    try {
      const dataResponse = await axios.get(dataUrl, { headers: this.headers });
      return dataResponse.data;
    } catch (err) {
      return err;
    }
  }

  async createDataset(datasetSchema) {
    await this.init();
    const url = this.baseUrl;
    try {
      const body = datasetSchema;
      const response = await axios.post(url, body, { headers: this.headers });
      return response.data
    } catch (err) {
      return err;
    }
  }
  

  async getTables(datasetId) {
    await this.init();
    const url = this.baseUrl + `/${datasetId}/tables`
    try {
      const response = await axios.get(url, {headers: this.headers });
      return response.data;
    } catch (err) {
      return err;
    }
  }


  async postRows(datasetId, tableName, rows) {
    await this.init();
    const postRowsUrl = this.baseUrl + `/${datasetId}/tables/${tableName}/rows`
    try {
      const postRowsResponse = await axios.post(postRowsUrl, {"rows": rows}, { headers: this.headers});
      return postRowsResponse.status;
    } catch (err) {
      return err;
    }
  }
}

module.exports = DatasetService;