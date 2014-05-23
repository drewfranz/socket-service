var _ = require('underscore');
var request = require('request');
var util = require('util');

var referer = "http://dev.creativelive.com";
var sessionCookies = null;

function parseResponseCookies(responseCookieHeaders) {
  var parsedResponseCookies = [];
  
  for (var i = 0; i < responseCookieHeaders.length; i++) {
    var responseCookieHeader = responseCookieHeaders[i];
    var j = responseCookieHeader.indexOf(';');
    var parsedResponseCookie = responseCookieHeader.substring(0, j);
    parsedResponseCookies.push(parsedResponseCookie);
  }
  return parsedResponseCookies;
}

function getAdminSession(callback) {
  if (sessionCookies) {
    return callback(null, sessionCookies);
  }
  request({
    method : "POST",
    uri : "http://localhost:5000/api/admin/auth",
    body : {
      name : "terry.ford@creativelive.com",
      pass : "Fu8a$hank"
    },
    json : true
  }, function(err, response, body) {
    var responseCookieHeaders = null;

    if (err) {
      return callback(err);
    }
    responseCookieHeaders = response.headers['set-cookie'];
    sessionCookies = parseResponseCookies(responseCookieHeaders);
    return callback(null, sessionCookies);
  });
}

var moderationStates = [
  'submitted',
  'candidate',
  'onDeck',
  'asked',
  'flagged'
];

function getNextModerationState(currentModerationState) {
  var currentIndex = moderationStates.indexOf(currentModerationState);
  var newIndex = (currentIndex + 1) % moderationStates.length;

  return moderationStates[newIndex];
}

var question = {
  retrieve : function(callback) {
    request({
      method : "GET",
      uri : 'http://localhost:5000/api/data/questions/537e4a5765221f70693a33c6',
      json : true,
      headers : {
        "Referer" : "http://dev.creativelive.com"
      }
    }, function(err, response, body) {
      if (err) {
        return callback(err);
      }
      if (response.statusCode !== 200) {
        return callback(body.errors);
      }
      callback(null, [body.data]);
    });
  },
  
  update : function(newDocument, callback) {
    getAdminSession(function(err, cookies) {
      if (err) {
        return callback(err);
      }
      request({
        method : "POST",
        uri : "http://localhost:5000/api/data/questions",
        headers : {
          "Referer" : referer,
          "Cookie" : cookies.join(';')
        },
        body : {
          _id : newDocument._id,
          moderation_state : newDocument.moderation_state
        },
        json : true
      }, function(err, response, body) {
        if (err) {
          return callback(err);
        }
        callback(null);
      });      
    });
  },

  applyOperation : function(operation, callback) {
    if (operation.isIncrementState()) {
      return question.applyIncrementState(operation, callback);
    } else if (operation.isInsert()) {
      return question.applyInsert(operation, callback);
    }
    
    else {
      callback(null);
    }
  }, // End apply operation.
  
  applyIncrementState : function(operation) {
    question.retrieve(function(err, rawQuestions) {
      var rawQuestion = rawQuestions[0];
      var currentModerationState = null;
      var nextModerationState = null;
      
      if (err) {
        return callback(err);
      }
      currentModerationState = rawQuestion.moderation_state;
      nextModerationState = getNextModerationState(currentModerationState);
      question.update({
        _id : rawQuestion._id,
        moderation_state : nextModerationState
      }, callback);    
    });

  },

  applyInsert : function(operation, callback) {
    var rawOperation = operation.original;
    var newDocument = rawOperation.data;

    getAdminSession(function(err, cookies) {
      if (err) {
        return callback(err);
      }
      request({
        method : "POST",
        uri : "http://localhost:5000/api/data/questions",
        headers : {
          "Referer" : referer,
          "Cookie" : cookies.join(';')
        },
        body : newDocument,
        json : true
      }, function(err, response, body) {
        if (err) {
          return callback(err);
        }
        callback(null, body.data[0]);
      });      
    });
  }
};

module.exports = question;
