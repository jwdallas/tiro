$.get('/feed', function(data) {
  $('article').interpolate(data);
});


$('form').submit(function(e) {
  e.preventDefault();
  var formData = $('form').serialize();
  $.ajax({
    type: 'POST',
    url: '/add',
    data: formData
  })
    .done(function(data) {
      console.log(data)
    });
});