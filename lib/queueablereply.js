var classify = require('classify-js');

var replies = {};

var QueueableReply = classify({
  name : 'QueueableReply',
  initialize : function(options) {
    this._reply = options.reply || this._lookupReply();
    replies[this.getReplyId()] = this._reply;
  },
  classMethods : {},
  instanceMethods : {
    getReply : function() {
      var self = this;

      if (!self._reply) {
        return null;
      }
      return function(data) {
        self._reply(data);
        delete replies[self.getReplyId];
      };
    },
    getReplyId : function() {
      throw new Error("getId unimplimented");
    },
    onQueued : function() {
      throw new Error("onQueued unimplimented");
    },
    onProcessed : function() {
      throw new Error("onProcessed unimplimented");
    },
    handleEnqueueError : function(err) {
      throw new Error("handleEnqueueError unimplimented!");
    },
    handleProcessingError : function(err) {
      throw new Error("handleProcessingError unimplimented!");
    },
    _lookupReply : function() {
      return replies[this.getReplyId()];
    }
  }
});

module.exports = QueueableReply;
