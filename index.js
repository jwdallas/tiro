// -------------------------
// intialize node server
// -------------------------
var express = require('express'),
    app = express();

// handle requests
app.configure(function(req, res, next) {
  app.use(express.static(__dirname + '/public'));
});

app.listen(3000);
console.log('Listening on port 3000');

// -------------------------
// initialize Twitter API
// -------------------------
var fs = require('fs'),
    twit = require('twit');

function getFeed(res) {
  parseAccess();
  
  function parseAccess() {
    fs.readFile('access.json', function(err, data) {
      if(err) { throw err; }

      var access = JSON.parse(data);
      engageWithTwitter(access);
    });
  };

  function engageWithTwitter(access) {
    var t = new twit({
      consumer_key:         access.twitter.consumer_key,
      consumer_secret:      access.twitter.consumer_secret,
      access_token:         access.twitter.access_token,
      access_token_secret:  access.twitter.access_token_secret
    });
  
    t.get('favorites/list', { count:100 }, function(err, reply) {
      if(err) { throw err; }
      sendData(reply);
    });
  };
  
  function sendData(data) {
    res.send(data);
  };
}

// prevent exceeding of API rate limit during development
function dummyData(res) {
  fs.readFile('dummy_data.json', function(err, data) {
    if(err) { throw err; }

    var data = JSON.parse(data);
    res.send(data);
  });
}

// -------------------------
// give data to client
// -------------------------
app.get('/feed', function(req, res) {
  // getFeed(res);
  dummyData(res);
});