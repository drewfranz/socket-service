var classify = require('classify-js');
var Identity = require('./identity');

var IncrementState = classify({
  name : "IncrementState",
  inherits : [Identity],
  initialize : function() {
    this.setType('incrementState');
  },
  instanceMethods : {
    evolveByDelete : function(deleteOp) {
      if (deleteOp.getQuestionId() === this.getQuestionId()) {
        return new Identity({
          context : this.getContext()
        });
      }
      return this;
    },
    evolveByIncrementState : function(incrementStateOp) {
      if (incrementStateOp.getQuestionId() === this.getQuestionId()) {
        return new Identity({
          context : this.getContext(),
          uuid    : this.uuid,
          questionId : this.questionId
        });
      }
    }
  }
});

module.exports = IncrementState;
