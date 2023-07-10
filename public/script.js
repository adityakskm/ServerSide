const messageDiv = document.getElementById('input');

  function readContents() {
    $.get('message.txt', function(data) {
      var lines = data.split('\n');
      if(lines == "")
      return
        $.each(lines, function(index, line) {
          if(line != "")
          messageDiv.innerHTML += `<p>> <span>Message --></span>: "<i>${line}</i>"</p>`
        });
    })
    .fail(function(xhr, status, error) {
      console.log('Error:', error);
    });
  }
  // Initial call to read the file contents
  readContents();

  setTimeout(function() {
    location.reload();
  }, 3000);
