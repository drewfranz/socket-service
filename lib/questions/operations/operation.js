var classify = require('classify-js');
var Queueable = require('../../queueable');

var Operation = classify({
  name : "Operation",
  initialize : function(options) {
    this.original = options.original;
    this.reply = options.reply;
    this.uuid = this.original.uuid || null;
    this.type = this.original.type || null;
  },
  classMethods : {
  },
  instanceMethods : {
    getOriginal : function() {
      return this.original;
    }
    getType : function() {
      return this.type;
    },
    getReply :function() {
      return this.reply;
    }
  }
});

module.exports = Operation;
