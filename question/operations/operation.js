var classify = require('classify-js');

var operationTypes = {
  'insert'        : true,
  'delete'        : true,
  'identity'      : true,
  'incrementState': true
};

var Operation = classify({
  name : "Operation",
  initialize : function(options) {
    this.questionId = options.questionId || null;
    this.uuid = options.uuid || null;
    this.type = options.type || null;
    this.context = options.context || 0;
  },
  classMethods : {
    assertValidType : function(type) {
      if (!operationTypes[type]) {
        throw new Error("Operation type " + type + " is not valid.");
      }
    },
    create : function(rawOperation) {
      
    }
  },
  instanceMethods : {
    getQuestionId : function() {
      return this.questionId
    },
    getType : function() {
      return this.type;
    },
    setType : function(type) {
      Operation.assertValidType(type);
      this.type = type;
    },
    getContext : function() {
      return this.context;
    },
    incrementContext : function() {
      this.context = 1;
    },
    isInsert : function() {
      return this.type === 'insert';
    },
    isDelete : function() {
      return this.type === 'delete';
    },
    isIncrementState : function() {
      return this.type === 'incrementState';
    },
    isIdentity : function() {
      return this.type === 'identity';
    },
    evolveBy : function(operation) {
      this.incrementContext();
      if (operation.isInsert()) {
        return this.evolveByInsert(operation);
      }
      if (operation.isDelete()) {
        return this.evolveByDelete(operation);
      }
      if (operation.isIncrementState()) {
        return this.evolveByIncrementState(operation);
      }

      // Operation is identity.
      return this;
    }
  }
});

module.exports = Operation;
