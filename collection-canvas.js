var getURLVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
var googleKey = getURLVars()['googleKey']
var sheet = getURLVars()['sheet']
var category = getURLVars()['category'].split(',')
var displayed = getURLVars()['displayed'].split(',')
displayedColumns = displayed
categoryColumns = category


var JSONURL = 'https://spreadsheets.google.com/feeds/cells/'+googleKey+'/'+sheet+'/public/basic?alt=json'




var iframeMaker = function() {

	exports = {}
    var commentsList
    
    var fillComments = function(){
        var value = $('.category').val();
        $('.commentsTable').empty()
        for (var i=0;i<commentsList.length;i++){
            if (commentsList[i][0] == value){
                for (var j=0;j<commentsList[i].length;j++){
                    if (j==0){
                         $('.commentsTable').append('<tr class="comments"><td class="comments"><b>'+commentsList[i][j]+'</b></td></tr>')
                    }
                    else{
                        $('.commentsTable').append('<tr class="comments"><td class="comments">'+commentsList[i][j]+'</td></tr>')
                    }
                }
                                               
            }
        
        }
    }
  var showModal = function() {

    $('.modal-body').empty();
    $('.modal-footer').empty();

    var URL = $(this).parent().parent().find('iframe').attr('src');
    console.log(URL)
    commentsList = getEverything().getDisplayedColumns(URL)
    var commentsBox = $('<div class= "commentsBox"><select class="category"></select><button class = "fill-comments btn" onClick = "iframeMaker.fillComments()">View</button></div>')
    var commentsDisplay = $('<div class= "commentsDisplay"><table class="title"></table><table class="commentsTable table table-striped"><tbody><tr><td>"examples"</td></tr></tbody></table></div>')
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+URL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    
    $('.modal-body').append(iframeDiv).append(commentsBox).append(commentsDisplay)
    $('.modal-footer').append(closeButton, URLbutton)
    for (var i=0;i<commentsList.length;i++){
        var title = commentsList[i][0]
        $('.category').append('<option value="'+title+'">'+title+'</option>')
    }
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
    exports.fillComments = fillComments
	return exports
}();

var JSONdata 
    
//this calls the JSON cells feed of a published google spreadsheet   
$.getJSON( JSONURL, function(data) {
        JSONdata = data
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