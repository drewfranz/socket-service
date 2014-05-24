var queue = require('./queue');
var operationFactory = require('./operations');

queue.setCollectionName('coursequeues');

function processQueue(mongoQueue) {
  mongoQueue.checkQueue(function(err, rawOperation) {
    var queuedOperation = null;

    if (err) {
      console.log("There was an error checking the Queue!\n");
      return null;
    }
    if (!rawOperation) {
      return null; // Queue is done, for now.
    }
    queuedOperation = operationFactory.create({
      rawOperation : rawOperation
    });
    queuedOperation.process(function(err) {
      if (err) {
        console.log("There was an error processing the queued Operation!\n", err);
        return queuedOperation.handleProcessingError(err);
      }
      queuedOperation.onProcessed();
      mongoQueue.dequeue(function(err) {
        if (err) {
          console.log("There was an error dequeuing : \n", queuedOperation);
        }
        processQueue(mongoQueue);
      });
    });
  });
}

function handle(queueableOperation) {
  var queueCriteria = queueableOperation.getCriteria();
  var mongoQueue = queue.select(queueCriteria);

  mongoQueue.enqueue(queueableOperation.toJSON(), function(err, newLength) {
    if (err) {
      console.log("There was an error enqueing the operation:\n", queueableOperation);
      return queuableOperation.handleEnqueueError(err);
    }
    queueableOperation.onQueued();
    if (newLength === 1) { // First element in queue, for now.
      processQueue(mongoQueue);
    }
  });
}

function queueOperation(rawOperation, reply) {
  var queableOperation = operationFactory.create({
    rawOperation : rawOperation,
    reply        : reply
  });

  handle(queableOperation);
}


module.exports = {
  queueOperation : queueOperation,
  processQueue : processQueue
};
