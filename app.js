var Hapi       = require('hapi');
var pubnub     = require('pubnub');
var MongoQueue = require('mongoqueue');
var _          = require('underscore');

var port = 3050;

var server = new Hapi.Server('0.0.0.0', port);

var mongoQueue = new MongoQueue({
  collectionName : 'questionops',
  criteria       : {
    course : 'course1'
  }
});

function processQueue() {
  mongoQueue.checkQueue(function(err, queueTop) {
    if (err) {
      console.log("There was an error checking the Queue!\n");
      return null;
    }
    if (!queueTop) {
      return null; // Queue is done, for now.
    }
    console.log("Inside processQueue, I'm processing queuedQuestionOp:\n", queueTop);
    setTimeout(function() {
      console.log("Still processing queuedQuestionOp:\n", queueTop);
      setTimeout(function() {
        mongoQueue.dequeue(function(err) {
          if (err) {
            console.log("There was an error dequeueing :\n", queueTop);
          }
          console.log("Done processing queuedQuestionOp:\n", queueTop);
          processQueue();          
        });
      }, 3000);
    }, 3000);
  });
}

function enqueueQuestionOperation(questionOp, callback) {
  mongoQueue.enqueue(questionOp, function(err, newLength) {
    if (err) {
      return callback(err);
    }
    if (newLength === 1) { // First element in queue.
      processQueue();
    } else {
      console.log("Inside enqueueQuestionOperation, don't think I need to do anything\n");
    }
    callback(null);
  });
}

function handleQuestionOperation(request, reply) {
var questionOperation = request.payload;

  console.log("Handling a question op\n");
  enqueueQuestionOperation(questionOperation, function(err) {
    if (err) {
      return reply(Hapi.error.internal(err));
    }
    reply('{ "queued" : "your-request" }');
  });
}


server.route([
  {
    method : "POST", path : "/questions",
    config : {
      handler : handleQuestionOperation
    }
  }
]);

processQueue();

server.start(function() {
  console.log("Socket service started on port " + port);
});
