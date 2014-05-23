var Hapi = require('hapi');
var queueProcessor = require('./lib/queueprocessor');

var port = 3050;

var options = {
  cors : {
    origin : ['http://mcp.dev.creativelive.com']
  }
};

var server = new Hapi.Server('0.0.0.0', port, options);

server.route([
  {
    method : "POST", path : "/questions",
    config : {
      handler : function(request, reply) {
        var rawOperation = request.payload;

        queueProcessor.queueOperation(rawOperation, reply);
      }
    }
  },
  {
    method : "GET", path : "/questions/context",
    config : {
      handler : function(request, reply) {
        var rawJSON = request.query.payload;
        var rawOperation = JSON.parse(rawJSON);

        queueProcessor.queueOperation(rawOperation, reply); 
      }
    }
  }
]);

server.start(function() {
  console.log("Socket service started on port " + port);
});
