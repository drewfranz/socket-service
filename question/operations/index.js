var Identity = require('./identity');
var IncrementState = require('./incrementstate');

module.exports = {
  create : function(rawOperation) {
    if (rawOperation.type === 'identity') {
      return new Identity(rawOperation);
    } else if (rawOperation.type === 'incrementState') {
      return new IncrementState(rawOperation);
    }
  }
};
