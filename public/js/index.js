var socket = io("/rooms");
	socket.on("roomlist", (rooms) => {
	  let o = "", i = 0;
      for (x in rooms) {
      	if(i++<10) o+=`<li><span>${x}</span><span class="nr">${rooms[x]}</span></li>`
      };
      $("#socketlist").empty();
      $("#socketlist").append(o);
      $("#socketlist li").on("click", function(e){
      	$("#sockets").val($(this).children("span:first").text());
      });
	});

	$("body").on("click", ()=>$("#socketlist").css("display", "none"));

	$("#sockets").on("click", function(e) {
		e.stopPropagation();
		$("#socketlist").css("display", "block");
	});