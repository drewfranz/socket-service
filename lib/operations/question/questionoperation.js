var Boom = require('boom');
var classify = require('classify-js');
var confit = require('confit').vendors.pubnub;
var Operation = require('../operation');
var QueueableReply = require('../../queueablereply');
var Context = require('../../context');
var question = require('../../question');
var env = process.env.NODE_ENV || 'dev';

var pubnubConfig = confit.get('/', {env : env});

var pubnub = require('pubnub').init({
  publish_key : pubnubConfig.publish_key,
  subscribe_key : pubnubConfig.subscribe_key
});

var operationTypes = {
  'insert'        : true,
  'delete'        : true,
  'identity'      : true,
  'incrementState': true
};

var context = Context.select({
  course : 'course1'
});

var QuestionOperation = classify({
  name : 'QuestionOperation',
  inherits : [Operation, QueueableReply],
  initialize : function(options) {
    this.questionId = this.original.questionId || null;
    this.context = this.original.context || 0;
    this.evolved = options.evolved || null;
  },
  classMethods : {
    assertValidType : function(type) {
      if (!operationTypes[type]) {
        throw new Error("Operation type " + type + " is not valid.");
      }
    }
  },
  instanceMethods : {
    setType : function(type) {
      QuestionOperation.assertValidType(type);
      this.type = type;
    },
    getReplyId : function() {
      return this.getUUID();
    },
    getQuestionId : function() {
      return this.questionId
    },
    getContext : function() {
      return this.context;
    },
    incrementContext : function() {
      this.context += 1;
    },
    isInsert : function() {
      return this.type === 'insert';
    },
    isDelete : function() {
      return this.type === 'delete';
    },
    isIncrementState : function() {
      return this.type === 'incrementState';
    },
    isIdentity : function() {
      return this.type === 'identity';
    },
    process : function(callback) {
      var self = this;

      context.evolveOperation(self, function(err, evolvedOperation) {
        if (err) {
          return callback(err);
        }
        self.evolved = evolvedOperation.original;
        question.applyOperation(evolvedOperation, function(err) {
          if (err) {
            return callback(err);
          }
          context.storeOperation(evolvedOperation, callback);
        });
      });
    },
    evolveBy : function(operation) {
      this.incrementContext();
      if (operation.isInsert()) {
        return this.evolveByInsert(operation);
      }
      if (operation.isDelete()) {
        return this.evolveByDelete(operation);
      }
      if (operation.isIncrementState()) {
        return this.evolveByIncrementState(operation);
      }

      // Operation is identity.
      return this;
    },
    onQueued : function() {
      this.getReply()('{ "queued" : "your-request" }');
    },
    onProcessed : function() {
      pubnub.publish({
        channel : 'course1-question-operations',
        message : JSON.stringify(this.evolved),
        callback : function(e) { console.log("SUCCESS!", e); },
        error    : function(e) { console.og("FAILED! RETRY PUBLISH!", e); }
      });
    },
    handleEnqueueError : function(err) {
      this.getReply()(Boom.badImplementation(err));
    },
    handleProcessingError : function(err) {
      console.log("There was an error processing the queuedOperation:!\n", this.getOriginal());
    }
  }
});

module.exports = QuestionOperation;
