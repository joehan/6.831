var items = {}
var valueHolder
var URLList = []
                       
                       
function getEverything(){
    
    var getValues = function(){
        
        var values = JSONdata.feed.entry
        valueHolder= values
        return values
              
        };
    
        
    var parseData = function(){
        getValues()
        for (i=0;i<valueHolder.length;i++){
                      var rowNumber = valueHolder[i].title.$t.slice(1)
                      if (items[rowNumber] == undefined){
                          items[rowNumber] = [valueHolder[i].content.$t]
                      }
                      else{
                          items[rowNumber].push(valueHolder[i].content.$t)
                      }
                      
                  }
    }
    
    
    var findURLColumn = function(){
        for (i=0;i<items[1].length;i++){
            if (items[1][i] == 'URL'){
                return i;
            }
        }
    }
    
    var getURLList = function(){
        parseData()
        var columnNum = findURLColumn();
        for (key in items){
            URLList.push(items[key][columnNum])
        }
        removeDupes()
    }
    
    var removeDupes = function(){
        testList = []
        for (i=0;i<URLList.length;i++){
            if (testList.indexOf(URLList[i])==-1)
                testList.push(addProtocol(URLList[i]))
        }
        URLList=testList
    }
    
    var addProtocol = function(URL){
        if (URL.slice(0,4)!= 'http'){
            URL = 'http://'+URL
        }
        return URL
  }
    
return {'getValues':getValues, 'parseData':parseData, 'findURLColumn':findURLColumn, 'getURLList':getURLList}
}

// contains functions to set up main collection area and selection pane
var examplesInterface = (function() {

	var exports = {}

  ///////////// showNamePrompt, createCollection, and deleteCollection are used for the selection pane
  // to do - 
  // 1. make it so user can only enter letters
  // 2. make the active tab be connected with the main body to enable dragging between collections and the main group
  // 3. maybe make dragging from the main drag copies and don't connect the collections back to the main
  // 4. and then add a delete bucket at the bottom of the collections pane
  // 5. this way a particular example could be used in multiple collections

  // Toggles new collection input box, to be connected to "New Collection" button
  var showNamePrompt = function() {
    
    // arbitrary max number of tabs, can be changed. pretty much to prevent excessive amounts of tabs
    var maxCollections = 4;
    var numCollections = $('.collections').children().length;

    // toggle name input box and create button, only show if there's room for more tabs
    if ($(".collection-name").css("visibility") == "visible") {

        $(".collection-name").css("visibility", "hidden");

    } else {

        if (numCollections <= maxCollections) {

          $('.collection-name').css("visibility", "visible");

        } 
    }
  }

  // makes new collection in a tabbed list and connects it 
  var createCollection = function() {

    // variables to hold identifying information for new colleciton
    var collectionNumber = $('.collections').children().length;
    var collectionName = $('.collection-name-input')[0].value;
    
    // creates new collection if name is valid (to-do #1)
    if (collectionName !== "") {
      $('.collection-name-input').val("")
      $('.collection-name').css("visibility", "hidden");

      var newTab = $('<li><a class='+collectionName+' href=#'+collectionName+' data-toggle="tab">'+collectionName+'</a></li)');
      var newTabBody = $('<div id='+collectionName+' class="tab-pane"></div>')
      var newSortable = $('<ul id="sortable'+collectionNumber+'" class="connected'+collectionNumber+' group"></ul>')
      newTabBody.append(newSortable);

      $('.collections').append(newTab);
      $('.collections-content').append(newTabBody)

      // figure out how to make the main group connect with only the active group or with all groups
      // think about a for loop? 
      $('#sortable-main').sortable({
        connectWith: ".connected"+collectionNumber,
       }).disableSelection();
      $('#sortable'+collectionNumber).sortable({
        connectWith: ".connected-main"
       }).disableSelection();
    }

  }

  // deletes current collection and returns items to main pane. 
  // Bug: cannot create functional pane of the same name as a previously deleted one
  var deleteCollection = function() {
    var activeTab = $('.collections .active').text();
    if (activeTab !== "") {
      var collectedIframes = $($(document.getElementById(activeTab)).children()).children();
      $('#sortable-main').append(collectedIframes);
      $($(document.getElementById(activeTab)).children()).remove();
      $($("."+activeTab).parent()).remove();
      $("."+activeTab).remove();
    } 

  }

  // shows modal with URL-specific information, 'this' refers to the overlay div that was clicked on
  var showModal = function() {

    $('.modal-body').empty();
    $('.modal-footer').empty();

    // so many $. maybe there's a better way to do this.
    var URL = "'"+$($($($($(this)).parent()).parent()).find('iframe')).attr("src")+"'";
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+URL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    $('.modal-body').append(iframeDiv)
    $('.modal-footer').append(closeButton, URLbutton)
  }

  ///////// setup functions
	var setupExamples = function(div) {
 
    // make modal to view larger images of examples
    var modal = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
               +  '<div class="modal-header">'
               +    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
               +    '<h3 id="myModalLabel">Modal header</h3>'
               +  '</div>'
               +  '<div class="modal-body">'
               +  '</div>'
               +  '<div class="modal-footer">'
               +  '</div>'
               +'</div>';

    div.append(modal);
    
    // create iframe, overlay, and link to modal for each URL
    for (i=1;i<URLList.length;i++) {
			
      var link = $('<a data-toggle="modal" data-target="#myModal"></a>')
      var li = $('<li class = "iframe ui-state-default">')
			var overlay = $('<div class="overlay"></div>')
			var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+URLList[i]+' style="-webkit-transform:scale(0.15);-moz-transform-scale(0.15);">')

			link.append(overlay)
      overlay.on("click", showModal)
      li.append(link, iframe)
			div.append(li)

		}
	}
	exports.setupExamples = setupExamples;

  // set up area for collections of select examples
  var setupSelectionPane = function(div) {

    // html elements for selection pane skeleton
    var buttons = $('<div class="description"><button class="btn new-collection">New Collection</button><button class="btn delete-collection">Delete Collection</button></div>');
    var collectionNaming = $('<div class="collection-name"><input type="text" class="collection-name-input"></input><button class="btn name-submit">Submit</button></div>');
    var collectionTabs = $('<div class="tabbable"><ul class="nav nav-tabs collections"></ul><div class="collections-content tab-content"></div></div>');

    div.append(buttons, collectionNaming, collectionTabs);

    // attach click handlers to buttons + enter handler to input box
    $('.new-collection').on("click", showNamePrompt);
    $('.delete-collection').on("click", deleteCollection);
    $('.name-submit').on("click", createCollection);
    $('.collection-name-input').keydown(function(event){
        if(event.keyCode == 13) {
          $('.name-submit').click();
        }
    })
  }
  exports.setupSelectionPane = setupSelectionPane;

  // set up both main and selection panes within a fluid row
  var setupInterface = function(div) {

    var main = $('<div class="span9 main-grouping"><ul id="sortable-main" class="connected-main"></ul></div>');
    var select = $('<div class="span3 select-grouping"></div>');

    div.append(main, select);

    // make the main pane a sortable grid
    $('#sortable-main').sortable().disableSelection();

    // add examples to main pane and functionality to selection pane
    setupExamples($('#sortable-main'));
    setupSelectionPane($('.select-grouping'));
  }
  exports.setupInterface = setupInterface;

	return exports;
})();

var JSONdata 
    
    
$.getJSON( 'https://spreadsheets.google.com/feeds/cells/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
        JSONdata=data
    }).done(function(){
                      getEverything().getURLList();

                      $('.example-holder').each(function() {
		                      examplesInterface.setupInterface($(this));
	                    });
                      

      })

