var classify = require('classify-js');
var Identity = require('./identity');

var Insert = classify({
  name : "Insert",
  inherits : [Identity],
  initialize : function() {
    this.setType('insert');
  }
});

module.exports = Insert;
