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
    this._questionId = options.id || null;
    this._type = options.type || null;
    this._context = options.context || 0; // How many ops had occurred when this was created
  },
  classMethods : {
    assertValidType : function(type) {
      if (!operationTypes[type]) {
        throw new Error("Operation type " + type + " is not valid.");
      }
    }
  },
  instanceMethods : {
    getQuestionId : function() {
      return this._questionId;
    },
    getType : function() {
      return this._type;
    },
    setType : function(type) {
      Operation.assertValidType(type);
      this._type = type;
    },
    getContext : function() {
      return this._context;
    },
    incrementContext : function() {
      this._context += 1;
    },
    isInsert : function() {
      return this._type === 'insert';
    },
    isDelete : function() {
      return this._type === 'delete';
    },
    isIncrementState : function() {
      return this._type ==='incrementState';
    },
    isIdentity : function() {
      return this._type === 'identity';
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
