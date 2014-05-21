var _ = require('underscore');

var question = {
  _data : {
    "the-one-true-question" : {
      text : "Why are we here?",
      state : 0
    }
  }
};

_.extend(question, {
  retrieve : function(callback) {
    callback(null, [question._data["the-one-true-question"]]);
  },
  applyOperation : function(operation, callback) {
    if (operation.isIncrementState()) {
      this._data['the-one-true-question'].state += 1;
    }
    callback(null);
  }
});

module.exports = question;
