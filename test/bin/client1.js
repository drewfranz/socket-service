var http = require('http');

var port = 3050;

var questionRequestOptions = {
  hostname : 'localhost',
  port     : port,
  path     : '/questions',
  method   : 'POST',
};

var body = {
  type : "insert",
  id   : "zazaewry-1",
  data : {
    poop : "face"
  }
};

var responseText = '';

var request = http.request(questionRequestOptions, function(response) {
  response.setEncoding('utf8');
  response.on('data', function(chunk) {
    responseText = responseText + chunk;
  });
  response.on('end', function() {
    var parsedResponse = JSON.parse(responseText);
    console.log("Got response:\n", parsedResponse);
  });
});
request.on('error', function(err) {
  console.log("There was an error with the request:\n", err);
});
body.id = body.id + new Date().getTime();
request.write(JSON.stringify(body));
request.end();
