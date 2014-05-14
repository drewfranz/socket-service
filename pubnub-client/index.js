var PubnubClient = require('./pubnub-client.js');

module.exports = {
  init : function(options) {
    var pubnubClient = new PubnubClient(options);

    return pubnubClient;
  }
};
