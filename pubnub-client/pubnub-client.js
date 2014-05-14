var http = require('http');
var classify = require('classify-js');

var uuid = 'f8873090-a2ba-472f-99c1-d93a957014d3';

var publishPathTemplate = "/publish/<PUBLISH_KEY>/<SUBSCRIBE_KEY>/0/<CHANNEL>/0?uuid=<UUID>&pnsdk=PubNub-JS-Nodejs%2F3.6.2";

var PubnubClient = classify({
  name : 'PubnubClient',
  initialize : function(options) {
    this._publishKey = options.publish_key;
    this._subscribeKey = options.subscribe_key;
  },
  classMethods : {

  },
  instanceMethods : {
    publish : function(options) {
      var channel = options.channel;
      var message = JSON.stringify(options.message);
      var callback = options.callback;
      var errorCallback = options.error;
      var path = this._fillPathTemplate(channel);

      this._makePostRequest(path, message, function(err, response) {
        if (err) {
          return errorCallback(err);
        }
        callback(response);
      });      
    },

    _fillPathTemplate : function(channel) {
      var path = publishPathTemplate.replace('<PUBLISH_KEY>', this._publishKey);
      
      path = path.replace('<SUBSCRIBE_KEY>', this._subscribeKey);
      path = path.replace('<CHANNEL>', channel);
      return path;
    },

    _makePostRequest : function(path, message, callback) {
      var requestOptions = {
        hostname : 'ps7.pubnub.com',
        port     : 80,
        path     : path,
        method   : 'POST'
      };
      var responseData = '';
      var request = http.request(requestOptions, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
          responseData = responseData + chunk;
        });
        response.on('end', function() {
          callback(null, responseData);
        });
      });
      request.on('error', function(err) {
        return callback(err);
      });
      request.write(message);
      request.end();
    }
  }
});

module.exports = PubnubClient;
