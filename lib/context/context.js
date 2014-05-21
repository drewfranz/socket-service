var mongodb  = require('mongodb');
var classify = require('classify-js');
var _        = require('underscore');
var PersistantOperation = require('./persistantoperation');
var operationFactory = require('../operations');
console.log("Inside /Users/terranceford/vagrant/src/socket-service/lib/context/context.js, The result of requiring operationFactory is:\n", operationFactory);
var async    = require('async');

var db = null;
var connectionString = "mongodb://localhost:27017/test";

var defaultCollectionName = 'contexts';

var howManyOpsField = "howManyOps";

var howManyOpsFields = {};
howManyOpsFields[howManyOpsField] = 1;

var exists = {};

var Context = classify({
  name : "Context",
  initialize : function(options) {
    this._collectionName = options.collectionName || defaultCollectionName;
    this._criteria = options.criteria || {};
    this._collection = null;
    this._persistantOperation = new PersistantOperation({
      criteria : this._criteria,
      collectionName : 'completedquestionops'
    });
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
    },
    getHowManyOpsField : function() {
      return howManyOpsField;
    },
    getHowManyOpsFields : function() {
      return howManyOpsFields;
    },
    getHowManyOpsUpdate : function(howManyOps) {
      var howManyOpsUpdate = _.extend({}, Context.getHowManyOpsFields());

      howManyOpsUpdate[Context.getHowManyOpsField()] = howManyOps;
      return howManyOpsUpdate;
    }
  },
  instanceMethods : {
    retrieve : function(callback) {
      var self = this;

      self._ensureExistence(function(err, existenceKey) {
        if (err) {
          return callback(err);
        }
        self.getCollection(function(err, collection) {
          if (err) {
            return callback(err);
          }
          collection.find(self.getCriteria()).toArray(function(err, results) {
            if (err) {
              return callback(err);
            }
            callback(null, results[0]);
          });
        });
      })

    },
    getPersistantOperation : function() {
      return this._persistantOperation;
    },
    storeOperation : function(evolvedOperation, callback) {
      var self = this;
      
      self._persistantOperation.save(evolvedOperation.original, function(err, savedOperation) {
        var howManyOps = null;

        if (err) {
          return callback(err);
        }
        howManyOps = evolvedOperation.getContext() + 1;
        self.setHowManyOps(howManyOps, function(err, howManyOps) {
          if (err) {
            return callback(err);
          }
          callback(null, savedOperation);
        });
      });
    },
    evolveOperation : function(operation, callback) {
      var self = this;

      self.checkHowManyOps(function(err, howManyOps) {
        if (err) {
          return callback(err);
        }
        async.whilst(
          function() { 
            return (operation.context < howManyOps); 
          },
          function(cb) {
            self._getOperation(operation.context, function(err, completedOperation) {
              if (err) {
                return cb(err);
              }

              operation = operation.evolveBy(completedOperation);
              cb();
            });
          },
          function(err) {
            if (err) {
              return callback(err);
            }
            callback(null, operation);
          }
        );
      });
    },
    processOperation : function(operation, callback) {
      if (operation.type = 'getQuestionContext') {
        return callback("the current question context is:...poop");
      }
    },
    getCriteria : function() {
      return _.extend({}, this._criteria);
    },
    getCollection : function(callback) {
      var self = this;
      
      if (self._collection) {
        return callback(null, self._collection);
      }
      Context.getDb(function(err, db) {
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
    },
    checkHowManyOps : function(callback) {
      var self = this;

      self._ensureExistence(function(err, contextDocumentId) {
        var howManyOps = null;
        
        if (err) {
          return callback(err);
        }
        self.getCollection(function(err, collection) {
          if (err) {
            return callback(err);
          }
          collection.findOne(self.getCriteria(), function(err, contextDocument) {
            if (err) {
              return callback(err);
            }
            howManyOps = contextDocument[Context.getHowManyOpsField()];
            callback(null, howManyOps);
          });
        });      
      });
    },
    setHowManyOps : function(howManyOps, callback) {
      var self = this;
      var howManyOpsUpdate = Context.getHowManyOpsUpdate(howManyOps);
      
      howManyOpsUpdate = _.extend(howManyOpsUpdate, self.getCriteria());
      self.getCollection(function(err, collection) {
        if (err) {
          return callback(err);
        }
        self._ensureExistence(function(err) {
          if (err) {
            return callback(err);
          }
          collection.findAndModify(
            self.getCriteria,   // query
            [[ "_id", "asc" ]], // sort
            howManyOpsUpdate,   // update "doc"
            {                   // options
              "new" : true      // callback with the newest version.
            },
            function(err, newDocument) {
              var newHowManyOps = null;
              
              if (err) {
                return callback(err);
              }
              newHowManyOps = newDocument[Context.getHowManyOpsField()];
              callback(null,  newHowManyOps);
            }
          );
        });
      });
    },
    _getOperation : function(context, callback) {
      var self = this;
      var persistantOperation = self.getPersistantOperation();
      var criteria = null;

      criteria = _.extend(persistantOperation.getCriteria(), {
        context : context
      });
      persistantOperation.getCollection(function(err, collection) {
        if (err) {
          return callback(err);
        }
        collection.findOne(criteria, function(err, rawOperation) {
          var queueableOperation = null;

          if (err) {
            return callback(err);
          }
          queueableOperation = operationFactory.create({
            rawOperation : rawOperation
          });
          callback(null, queueableOperation);
        });
      });
    },
    _ensureExistence : function(callback) {
      var self = this;
      var existenceKey = self._makeExistenceKey();

      if (exists[existenceKey]) {
        return callback(null);
      }
      self._findOrCreate(function(err, contextDocument) {
        var contextDocumentId = null;
        
        if (err) {
          return callback(err);
        }
        contextDocumentId = contextDocument._id;
        exists[existenceKey] = contextDocumentId;
        callback(null, contextDocumentId);
      });
    },
    _makeExistenceKey : function() {
      var keyObject = {
        collectionName : this._collectionName,
        criteria       : this._criteria
      };

      return JSON.stringify(keyObject);
    },
    _findOrCreate : function(callback) {
      var self = this;

      self.getCollection(function(err, collection) {
        if (err) {
          return callback(err);
        }
        collection.findAndModify(
          self._criteria,       // query
          [[ "_id", "asc" ]],   // sort
          {                     // update "doc:"
            "$setOnInsert" : self._newContextDocument()
          },                 
          {                     // options
            upsert : true,
            "new"    : true // Return newly-inserted doc.
          },
          callback
        );
      });
    },
    _newContextDocument : function() {
      var newContextDocument = _.extend({}, this.getCriteria());

      newContextDocument[Context.getHowManyOpsField()] = 0;
      return newContextDocument;
    }
  }
});

module.exports = Context;
                          




