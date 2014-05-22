var classify = require('classify-js');

var Operation = classify({
  name : "Operation",
  inherits : [],
  initialize : function(options) {
    this.original = options.original;
    this.uuid = this.original.uuid || null;
    this.type = this.original.type || null;
  },
  classMethods : {
  },
  instanceMethods : {
    getOriginal : function() {
      return this.original;
    },
    getUUID : function() {
      return this.uuid;
    },
    getType : function() {
      return this.type;
    },
    toJSON : function() {
      return this.original;
    }
  }
});

module.exports = Operation;
