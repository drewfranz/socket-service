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
        return self._toIdentity();
      }
      return this;
    },
    evolveByIncrementState : function(incrementStateOp) {
      if (incrementStateOp.getQuestionId() === this.getQuestionId()) {
        return this._toIdentity();
      }
      return this;
    },
    _toIdentity : function() {
      return new Identity({
        original : {
          questionId : this.questionId,
          context    : this.getContext(),
          uuid       : this.getUUID()
        },
        reply : this.getReply()
      });
    }
  }
});

module.exports = IncrementState;
