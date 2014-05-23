var modules = {
  'identity'       : './question/identity',
  'incrementState' : './question/incrementstate',
  'insert'         : './question/insert',
  'getContext'     : './context/getcontext',

};

function getModule(name) {
  var module = modules[name];

  if (typeof module === 'string') {
    modules[name] = require(module);
  }
  return modules[name];
}

module.exports = {
  create : function(options) {
    var rawOperation = options.rawOperation;
    var reply = options.reply;
    var Queueable = getModule(rawOperation.type);

    return new Queueable({
      original : rawOperation,
      reply    : reply
    });
  }
}
