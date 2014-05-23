var classify = require('classify-js');

var Operation = classify({
  name : "Operation",
  inherits : [],
  initialize : function(options) {
    this.original = options.original;
    this.uuid = this.original.uuid || null;
    this.type = this.original.type || null;
    this.course = this.original.course;
    if (!this.course) {
      throw new Error("Need course on original message");
    }

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
    getCriteria : function() {
      return {
        course : this.course
      };
    },
    toJSON : function() {
      return this.original;
    }
  }
});

module.exports = Operation;
