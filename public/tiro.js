$.get('/feed', function(data) {
  $('#tweets li').interpolate(data);
  $('#tweets').removeAttr('hidden');
});


$('#tweets li').on('dragstart', function(e){
  $(this).attr('aria-grabbed', true);
  
  var data = {
    id: $('p', this).attr('data-id'),
    text: $('p', this).html(),
    author: $('cite', this).html(),
    time: $('time', this).html()
  }
  
  e.originalEvent.dataTransfer.setData('application/json', JSON.stringify(data));
});

$('#tweets li').on('dragend', function(){
  $(this).removeAttr('aria-grabbed');
  $('form').removeAttr('aria-dropeffect');
});

$('form').on('dragenter', function(){
  $(this).attr('aria-dropeffect', 'move');
});

$('form').on('dragleave', function(){
  $(this).removeAttr('aria-dropeffect');
});

$('form').on('drop', function(e){
  var data = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
  $.ajax({
    type: 'POST',
    url: '/add',
    data: data
  })
    .done(function(response) {
      console.log(response);
    });
});


// $('form').submit(function(e) {
//   e.preventDefault();
//   var formData = $('form').serialize();
//   $.ajax({
//     type: 'POST',
//     url: '/add',
//     data: formData
//   })
//     .done(function(data) {
//       console.log(data)
//     });
// });