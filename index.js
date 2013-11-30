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
      formatData(reply, res);
    });
  };
}

// prevent exceeding of API rate limit during development
function dummyData(res) {
  fs.readFile('dummy_data.json', function(err, data) {
    if(err) { throw err; }

    var data = JSON.parse(data);
    formatData(data, res);
  });
}

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
        var links = linkType[linkNum],   
        url =             links.url,
        expandedURL =     links.expanded_url,
        displayURL =      links.display_url,
        media_url_https = links.media_url_https,
        hashtag =         links.text,
        screen_name =     links.screen_name,
        text =            data[entryNum].text,
        newText;
            
        switch(linkType) {        
          case urls:  
            newText = text.replace(url,"<a href='"+expandedURL+"'>"+displayURL+"</a>");
            break;
          case media:
            newText = text.replace(url,"<a href='"+media_url_https+"'>"+media_url_https+"</a>");
            break;
          case hashtags:
            newText = text.replace('#'+hashtag,"<a href='https://twitter.com/search?q=%23"+hashtag+"'>"+'#'+hashtag+"</a>");
            break;
          case user_mentions:
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
  // getFeed(res);
  dummyData(res);
});