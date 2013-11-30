$.get("/feed", function(data) {
  $('article').interpolate(data);
});