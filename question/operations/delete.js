var classify = require('classify-js');
var Operation = require('./identity');

var Delete = classify({
  name : 'Delete',
  inherits : [Identity],
  initialize : function() {
    this.setType('delete');
  },
  instanceMethods : {
    evolveByDelete : function(deleteOp) {
      if (deleteOp.getQuestionId() === this.getQuestionId()) {
        return new Identity({
          context : this.getContext()
        });
      }
      return this;
    }
  }
});

module.exports = Delete;
