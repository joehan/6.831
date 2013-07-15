
var iframeMaker = (function() {

	exports = {}

  var showModal = function() {

    $('.modal-body').empty();
    $('.modal-footer').empty();

    var URL = $(this).parent().parent().find('iframe').attr('src');
    console.log(URL)
    var comments = getEverything().getColumnContents(URL, 6)
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var commentsBox = $('<div class="comments" style = "border:1px solid black">'+comments+'</div>')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+URL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    $('.modal-body').append(iframeDiv).append(commentsBox)
    $('.modal-footer').append(closeButton, URLbutton)
  }

	var setup = function(div) {
        for (i=1;i<URLList.length;i++) {
          
            var link = $('<a data-toggle="modal" data-target="#myModal"></a>')
            var holder = $('<div id="draggable" class="iframe ui-widget-content ui-draggable"></div>')
            var overlay = $('<div class="overlay"></div>')
            var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+URLList[i]+' style="-webkit-transform:scale(0.24);-moz-transform-scale(0.25);">')
             
            link.append(overlay)
            holder.append(link, iframe)
                div.append(holder)
            overlay.on("click", showModal)
            holder.draggable({connectToSortable: ".selection"})
        }
    
	}
	exports.setup = setup
	return exports
})();

var JSONdata 
    
//this calls the JSON cells feed of a published google spreadsheet   
$.getJSON( 'https://spreadsheets.google.com/feeds/cells/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
        JSONdata=data
    }).done(function(){getEverything().getURLList();
                       $("#draggable-holder").each(function() {
		                      iframeMaker.setup($(this));
	                   })
                      })

//$(document).ready(function() {
//	$("#sortable").each(function() {
//		iframeMaker.setup($(this));
//	});
//});