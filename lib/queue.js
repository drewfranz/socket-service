var MongoQueue = require('mongoqueue');

var internals = {
  collectionName : null
};

var mongoqueues = {};

function makeKey(criteria) {
  return JSON.stringify(criteria);
}

var queueSelector = {
  setCollectionName : function(collectionName) {
    internals.collectionName = collectionName;
  },
  getCollectionName : function() {
    return internals.collectionName;
  },
  select : function(criteria) {
    var key = makeKey(criteria);

    if (!mongoqueues[key]) {
      mongoqueues[key] = new MongoQueue({
        collectionName : this.getCollectionName(),
        criteria       : criteria
      });
    }
    return mongoqueues[key];
  }
};

module.exports = queueSelector;
