var Hapi       = require('hapi');
var MongoQueue = require('mongoqueue');
var Context    = require('./question/context');
var _          = require('underscore');

var pubnub = require('./pubnub-client').init({
  publish_key  : 'pub-c-1ebc54b7-0670-4a6a-add2-86bc3a11ea20',
  subscribe_key: 'sub-c-086a2e4e-d173-11e3-8170-02ee2ddab7fe'
});

var port = 3050;

var options = {
  cors : {
    origin : ['http://mcp.dev.creativelive.com']
  }
};

var server = new Hapi.Server('0.0.0.0', port, options);

var mongoQueue = new MongoQueue({
  collectionName : 'questionops',
  criteria       : {
    course : 'course1'
  }
});

var context = new Context({
  collectionName : 'questionopcontexts',
  criteria : {
    course : 'course1'
  }
});

function processQueuedOperation(queuedOperation, callback) {
  context.evolveOperation(queuedOperation, function(err, evolvedOperation) {
    if (err) {
      return callback(err);
    }
    context.storeOperation(evolvedOperation, callback);
  });
}

function broadcastQuestionOp(questionOp) {
  pubnub.publish({
    channel : 'course1-question-operations',
    message : JSON.stringify(questionOp),
    callback : function(e) { console.log("SUCCESS!", e); },
    error    : function(e) { console.log("FAILED! RETRY PUBLISH!", e); }
  });
}

function processQueue() {
  mongoQueue.checkQueue(function(err, queuedOperation) {
    if (err) {
      console.log("There was an error checking the Queue!\n");
      return null;
    }
    if (!queuedOperation) {
      return null; // Queue is done, for now.
    }
    console.log("Inside processQueue, I'm processing queuedOperation:\n", queuedOperation);
    processQueuedOperation(queuedOperation, function(err, processedOperation) {
      if (err) {
        console.log("There was an error processing the queuedOperation:!\n", queuedOperation);
      } else {
        broadcastQuestionOp(processedOperation);
        mongoQueue.dequeue(function(err) {
          if (err) {
            console.log("There was an error dequeueing :\n", queuedOperation);
          }
          processQueue();
        });
      }
    });
    /*
      setTimeout(function() {
      console.log("Still processing queuedQuestionOp:\n", queueTop);
      setTimeout(function() {
      mongoQueue.dequeue(function(err) {
          if (err) {
          console.log("There was an error dequeueing :\n", queueTop);
          }
          console.log("Done processing queuedQuestionOp:\n", queueTop);
          broadcastQuestionOp(queueTop);
          processQueue();          
          });
          }, 3000);
          }, 3000);
    */
    //  });}
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
