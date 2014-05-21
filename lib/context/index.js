var Context = require('./context');

var contexts = {};

function makeKey(criteria) {
  return JSON.stringify(criteria);
}

var contextSelector = {
  select : function(criteria) {
    var key = makeKey(criteria);

    if (!contexts[key]) {
      contexts[key] = new Context({
        collectionName : 'questionopcontexts',
        criteria : criteria
      });
    }
    return contexts[key];
  }
};

module.exports = contextSelector;
