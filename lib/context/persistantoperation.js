var mongodb  = require('mongodb');
var classify = require('classify-js');
var _        = require('underscore');

var db = null;
var connectionString = "mongodb://localhost:27017/test";

var defaultCollectionName = 'operations';


var PersistantOperation = classify({
  name : "PersistantOperation",
  initialize : function(options) {
    this._collectionName = options.collectionName || defaultCollectionName;
    this._criteria = options.criteria || {};
    this._collection = null;
  },
  classMethods : {
    getDb : function(callback) {
      if (db) {
        return callback(null, db);        
      }      
      mongodb.connect(connectionString, function(err, connection) {
        if (err) {
          return callback(err);
        }
        db = connection;
        callback(null, db);
      });
    }
  },
  instanceMethods : {
    save : function(rawOperation, callback) {
console.log("INside /Users/terranceford/vagrant/src/socket-service/question/context/persistantoperation.js.save, got called with rawOperation:\n", rawOperation);
      var self = this;
console.log("INside /Users/terranceford/vagrant/src/socket-service/question/context/persistantoperation.js.save, about to use self.getCriteria:\n", self.getCriteria());
      var persistable = _.extend({}, rawOperation, self.getCriteria());
console.log("Inside /Users/terranceford/vagrant/src/socket-service/question/context/persistantoperation.js.save, the persistable operation is:\n", persistable);
      self.getCollection(function(err, collection) {
        if (err) {
          return callback(err);
        }
//console.log("Inside /Users/terranceford/vagrant/src/socket-service/question/context/persistantoperation.js, about to use the collection:\n", collection);
console.log("Inside /Users/terranceford/vagrant/src/socket-service/question/context/persistantoperation.js, about to save:\n");
        collection.save(persistable, callback);
      });
    },
    getCriteria : function() {
      return _.extend({}, this._criteria);
    },
    getCollection : function(callback) {
      var self = this;
      
      if (self._collection) {
        return callback(null, self._collection);
      }
      PersistantOperation.getDb(function(err, db) {
        if (err) {
          return callback(err);
        }
        db.collection(self._collectionName, function(err, collection) {
          if (err) {
            return callback(err);
          }
          self._collection = collection;
          callback(null, self._collection);
        });
      });
    }
  }
});

module.exports = PersistantOperation;
                          




