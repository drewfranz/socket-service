var assert = require('chai').assert;

var IncrementState = require('../../../question/operations/incrementstate');

describe('IncrementState', function() {
  describe('evolveBy', function() {
    it('should produce a no-op, in case the increment was previously done.', function() {
      var clientOp = new IncrementState({
        context : 1
      });
      var serverOp = new IncrementState({
        context : 1
      });
      var nextOp = clientOp.evolveBy(serverOp);
      assert.equal(nextOp.getContext(), 2, "Increased the context count");
      assert.equal(nextOp.isIdentity(), true, "Turned into an identity op");
    });
  });
});
