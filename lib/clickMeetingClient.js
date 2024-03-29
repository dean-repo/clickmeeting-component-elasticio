const { ApiKeyRestClient } = require('@elastic.io/component-commons-library');

const API_BASE_URI = 'https://api.clickmeeting.com/v1';

// various standard rest clients have been created that handle creating requests and some
// authentication for us. They are found in @elastic.io/component-commons-library
module.exports = class ClickMeetingClient extends ApiKeyRestClient {
  constructor(emitter, cfg) {
    // this first line is a hack for a small sailor bug
    // eslint-disable-next-line no-param-reassign
    if (!emitter.logger) emitter.logger = { trace: () => {} };

    // begin constructor
    super(emitter, cfg);
    this.cfg = cfg;
    this.cfg.resourceServerUrl = API_BASE_URI;
    this.apiKeyHeaderName = 'X-Api-Key';
    this.apiKeyHeaderValue = cfg.apiKey;
    this.authRestClient = new ApiKeyRestClient(emitter, cfg);
  }
};