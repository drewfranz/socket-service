var classify = require('classify-js');
var Identity = require('./identity');

var Insert = classify({
  name : 'Insert',
  inherits : [Identity],
  initialize : function(options) {
    this.setType('insert');
    this._data = options.data;
  },
  instanceMethods : {
    evolveByInsert : function(insertOp) {
      if (insertOp.getQuestionId() === this.getQuestionId()) {
        return new Identity({
          context : this.getContext()
        });
      }
      return this;
    },
    evolveByIncrementState : function(incrementStateOp) {
      if (incrementStateOp.getQuestionId() === this.getQuestionId()) {
        return new Identity({
          context : this.getContext()
        });
      }
    }
  }
});

module.exports = Insert;
