// -------------------------
// intialize node server
// -------------------------
var express = require('express'),
    app = express();

// handle requests
app.configure(function(req, res, next) {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

app.listen(3000);
console.log('Listening on port 3000');

// -------------------------
// engage with Twitter
// -------------------------
var twit = require('twit'),
    access = require('./access.json');

function getFeed(res) {
  var t = new twit({
    consumer_key:         access.twitter.consumer_key,
    consumer_secret:      access.twitter.consumer_secret,
    access_token:         access.twitter.access_token,
    access_token_secret:  access.twitter.access_token_secret
  });

  t.get('favorites/list', { count:100 }, function(err, reply) {
    if(err) { throw err; }
    formatData(reply, res);
  });
};

// prevent exceeding of API rate limit during development
function dummyData(res) {
  var data = require('./dummy_data.json');
  formatData(data, res);
};

function formatData(data, res) {
  for(var entryNum in data) {
    var ents = data[entryNum].entities,
    
    urls = ents.urls,
    media = ents.media,
    hashtags = ents.hashtags,
    user_mentions = ents.user_mentions;
    
    // don't format unless we need to
    if(urls) {
      formatLinks(urls);
    }
    if(media) {
      formatLinks(media);
    }
    if(hashtags) {
      formatLinks(hashtags);
    }
    if(user_mentions) {
      formatLinks(user_mentions);
    }
    
    function formatLinks(linkType) {
      for(var linkNum in linkType) {
        var link = linkType[linkNum],        
            url = link.url,
            text = data[entryNum].text,
            newText;
            
        switch(linkType) {        
          case urls:  
            var expandedURL = link.expanded_url;
            var displayURL = link.display_url;
            newText = text.replace(url,"<a href='"+expandedURL+"'>"+displayURL+"</a>");
            break;
          case media:
            var media_url_https = link.media_url_https;
            newText = text.replace(url,"<a href='"+media_url_https+"'>"+media_url_https+"</a>");
            break;
          case hashtags:
            var hashtag = link.text;
            newText = text.replace('#'+hashtag,"<a href='https://twitter.com/search?q=%23"+hashtag+"'>"+'#'+hashtag+"</a>");
            break;
          case user_mentions:
            var screen_name = link.screen_name;
            newText = text.replace('@'+screen_name,"<a href='https://twitter.com/"+screen_name+"'>"+'@'+screen_name+"</a>");
            break;
        }
        // set tweet text to newly formatted text
        data[entryNum].text = newText;
      };
    };
    
  }; // end loop
  
  sendData(data, res);
};

function sendData(data, res) {
  res.send(data);
};

// -------------------------
// give data to client
// -------------------------
app.get('/feed', function(req, res) {
  getFeed(res);
  // dummyData(res);
});

// -------------------------
// add data to database
// -------------------------
app.post('/add', function(req, res) {
  var nano = require('nano')('http://localhost:5984'),
      tiro = nano.use('tiro'),
      data = req.body.add;
  
  tiro.insert({ input: data }, data, function(err, body) {
    if (err) {
      console.log(err);
    } else {
      res.send('The mouse has the cheese.');
    }
  });
});