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
      var self = this;
      var persistable = _.extend({}, rawOperation, self.getCriteria());

      self.getCollection(function(err, collection) {
        if (err) {
          return callback(err);
        }
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
                          




