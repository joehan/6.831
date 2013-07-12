var items = {}
var valueHolder
var URLList = []
                       
//getEverything is called after the JSON data is recieved. It interprets the JSON data, and is used to generate the URLs that will  be displayed.                       
function getEverything(){
    
    //getValues is used to refernce the relvant data from gthe JSON feed. JSONdata.feed.entry contains cells locations, cell contents and other metadata. 
    var getValues = function(){
        
        var values = JSONdata.feed.entry
        valueHolder= values
        return values
              
        };
    
     //parseData takes the results of getValues, and turns it into an associative array called items. THe keys of this array are row numbers, and the values are arrays, where each item is the contents of 1 cell in that row.   
    var parseData = function(){
        getValues()
        for (i=0;i<valueHolder.length;i++){
              var rowNumber = valueHolder[i].title.$t.slice(1)
              console.log(rowNumber)
              if (items[rowNumber] == undefined){
                  items[rowNumber] = [valueHolder[i].content.$t]
              }
              else{
                  items[rowNumber].push(valueHolder[i].content.$t)
              }  
          }
    }
    
    //findColumn takes the name of a column in the Google docs spreadsheet, and return what column(and therefore, what array index) it is in. It currently is used to find URLs from a column named 'URL', and to find comments from a column named 'comments'.
    var findColumn = function(columnName){
        for (i=0;i<items[1].length;i++){
            if (items[1][i] == columnName){
                return i;
            }
        }
    }
    
    //getURLList uses items and findColumn to pull a list of URLs from the Google Doc. 
   var getURLList = function(){
        parseData()
        var columnNum = findColumn('URL');
        for (key in items){
            URLList.push(items[key][columnNum])
        }
        removeDupes()
    }
   
    //removeDupes removes duplicate URL from the URLList, so that the same site is not displayed multiple times. This deals with the 'Google Top result' problem, where the first few results of a google search get submitted many times. Also, this function calls addProtocol, which appends 'http://' to URLs that do not have a protocol already, which prevents some 404 errors.
    var removeDupes = function(){
        var testList = []
        for (i=0;i<URLList.length;i++){
            if (testList.indexOf(URLList[i])==-1)
                testList.push(addProtocol(URLList[i]))
        }
        console.log(testList)
        URLList=testList
    }
    
    //addPorotocol take a URL and adds 'http://' to the start, if there is no protocol there already.
    var addProtocol = function(URL){
        if (URL.slice(0,4)!= 'http'){
            URL = 'http://'+URL
        }
        return URL
    }
    
    //getComments takes a URL and returns an array of the comments about it. If a URL was submitted more than once and more than 1 has comments, all of the comments be in the array.
    var getComments = function(URL){
        var commentsList = []
        var URLColumn =findColumn('URL')
        var commentsColumn = findColumn('Comments')
                    
        for (var key in items){
            console.log(key)
            console.log(items[key][URLColumn])
            console.log(items[key][commentsColumn])
            if (addProtocol(items[key][URLColumn]) == URL){
                commentsList.push(items[key][commentsColumn])
            }                              
        }
        return commentsList
    }

    
    return {'getValues':getValues, 'parseData':parseData, 'findColumn':findColumn, 'getURLList':getURLList, 'getComments':getComments}
}


var iframeMaker = (function() {

	exports = {}

  var showModal = function() {

    $('.modal-body').empty();
    $('.modal-footer').empty();

    var URL = "'"+$($($($($(this)).parent()).parent()).find('iframe')).attr("src")+"'";
    console.log(URL)
    var comments = getEverything().getComments(URL)
    console.log(comments)
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var commentsBox = $('<div class="comments" style = "border:1px solid black">Comments go here</div>')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+URL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    $('.modal-body').append(iframeDiv).append(commentsBox)
    for (i=0;i<comments.length;i++){
        $('.comments').append(comments[i])
    }
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