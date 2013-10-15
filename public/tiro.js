$.get("/feed", function(data) {
  $('article').interpolate(data);
  $('article p').each(function(){
    var text = $(this).html();
    $(this).html(makeLinks(text));
  });
});

function makeLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var linkMatch = text.match(exp);
  return text.replace(exp,"<a href='$1'>$1</a>");
};
     
function unshorten(link) {
  $.ajax({
    dataType: 'jsonp',
    url: 'http://expandurl.me/expand',
    data: {
        url: link,
        format: 'jsonp'
    },
    success: function(response) {
      console.log(response.end_url);
    },
    error: function (xhr) {
      console.log(xhr.statusText);
    }
  });
};