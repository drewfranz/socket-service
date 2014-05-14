var classify = require('classify-js');
var Operation = require('./operation');

var Identity = classify({
  name : "Identity",
  inherits : [Operation],
  initialize : function() {
    this.setType('identity');
  },
  instanceMethods : {
    evolveByInsert : function(insertOp) {
      return this;
    },
    evolveByDelete : function(deleteOp) {
      return this;
    },
    evolveByIncrementState : function(incrementStateOp) {
      return this;
    }
  }
});

module.exports = Identity;
