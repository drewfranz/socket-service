var Boom = require('boom');
var classify = require('classify-js');
var Context = require('../../context');
var Operation = require('../operation');
var QueueableReply = require('../../queueablereply');
var question = require('../../question');

var context = Context.select({
  course : 'course1'
});

var GetContext = classify({
  name : 'GetContext',
  inherits : [Operation, QueueableReply],
  initialize : function(options) {
    this.response = options.response || null;
  },
  classMethods : {},
  instanceMethods : {
    getResponse : function() {
      return this.response;
    },
    getReplyId : function() {
      return this.getUUID();
    },
    process : function(callback) {
      var self = this;
      
      context.retrieve(function(err, context) {
        if (err) {
          return callback(err);
        }
        question.retrieve(function(err, questions) {
          if (err) {
            return callback(err);
          }
          self.response = {
            context : context,
            questions : questions
          };
          callback();
        });
      });
    },
    onQueued : function() {
      return;
    },
    onProcessed : function() {
      var reply = this.getReply();

      if (reply) {
        reply(this.getResponse());
      }
    },
    handleEnqueueError : function(err) {
      this.getReply()(Boom.badImplementation(err));
    },
    handleProcessingError : function(err) {
      this.getReply()(Boom.badImplementation(err));
    }
  }
});

module.exports = GetContext;
