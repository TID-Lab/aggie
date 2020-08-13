let auth = require(__dirname + "/authentication.js");
let utils = require(__dirname + "/utils.js");
let config = require(__dirname + "../../config/config.json").powerBI;
const axios = require('axios')

class DashboardService {
  constructor() {
    this.headers;
    this.baseUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/dashboards/${config.dashboardId}`
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

  async generateEmbedToken() {
    await this.init();
    const dataUrl = this.baseUrl + '/GenerateToken';
    try {
      const dataResponse = await axios.post(dataUrl, {"accessLevel" : "view"}, { headers: this.headers });
      return dataResponse.data;
    } catch (err) {
      return err
    }
  }

  async getDashboard() {
    await this.init();
    const dataUrl = this.baseUrl;
    try {
      const dataResponse = await axios.get(dataUrl, { headers: this.headers });
      return dataResponse.data;
    } catch (err) {
      return err
    }
  }
}

module.exports = DashboardService;