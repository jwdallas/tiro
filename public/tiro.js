var feed;

$.get('/feed', function(data) {
  $('article').interpolate(data);
  feed = data;
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

// $('article').on('click', function() {
//   var id = $(this).attr('id');
//   $.each(feed, function(i, v) {
//       if (v.id == id) {
//           alert(v.text);
//           return;
//       };
//   });
// });