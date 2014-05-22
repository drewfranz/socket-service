var classify = require('classify-js');
var QuestionOperation = require('./questionoperation');

var Identity = classify({
  name : "Identity",
  inherits : [QuestionOperation],
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
