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



// contains functions to set up main collection area and selection pane

// to-do: make collection modal work. instructions before showCollectionModal.
// stop calling two modals at once!!
// fix layout of collection modal
// look into parse as a storage thingy.
var examplesInterface = (function() {

  // variables for storage of collections
  var storedNamesList = [];
  var storedBody = {};

  // arbitrary max number of collections, changable
  var maxCollections = 4;

  // holds functions and variables accessible outside of the module
	var exports = {};

  // showNamePrompt, createCollection, and deleteCollection are used for the selection pane

  // Toggles new collection input box, to be connected to "New Collection" button
  var showNamePrompt = function() {
    
    var numCollections = $('.collections').children().length;

    // toggle name input box and create button, only show if there's room for more tabs
    if ($(".collection-name").css("visibility") == "visible") {
        
        $('.collection-alert').css('visibility', 'hidden')
        $(".collection-name").css("visibility", "hidden");

    } else {

        if (numCollections < maxCollections) {
          $('.collection-name').css("visibility", "visible");
        } 
    }
  }

  // makes new collection in a tabbed list and connects it to main group
  var createCollection = function(name) {

    // gives collection index #
    var collectionNumber = $('.collections').children().length;
    
    // collection names must be unique
    if (storedNamesList.indexOf(name) == -1) {

      // creates collection if user entered a name
      if (name !== '') {
        storedNamesList.push(name);

        // resets collection name input area
        $('.collection-alert').css('visibility', 'hidden')
        $('.collection-name-input').val("")
        $('.collection-name').css("visibility", "hidden");

        // HTML skeleton for new collection body
        var newTab = $('<li><a class=collection'+collectionNumber+' href=#collection'+collectionNumber+' data-toggle="tab">'+name+'</a></li)');
        var newTabBody = $('<div id=collection'+collectionNumber+' class="tab-pane"></div>')
        var newSortable = $('<ul id="sortable'+collectionNumber+'" class="connected'+collectionNumber+' group"></ul>')
        newTabBody.append(newSortable);

        $('.collections').append(newTab);
        $('.collections-content').append(newTabBody)

        // bind drop function to any iframe dropped into the collection, needed because onclick handlers
        // unbind when the object is moved
        $('#sortable'+collectionNumber).sortable({
          stop: function(event, ui) {
            storedBody["sortable"+collectionNumber] = $("#sortable"+collectionNumber).html()
          }
        }).disableSelection().droppable({
          drop: function(event, ui) {
            $(".overlay").on("click", showSingleModal)
            storedBody["sortable"+collectionNumber] = ui.draggable.parent().html()
          }

        });
      } 
    } else {
        $('.collection-alert').css('visibility', 'visible')
    }
  }

  // puts content of collections into localStorage
  var saveCollections = function() {

    // put collection names into storage
    localStorage['collection'] = JSON.stringify(storedNamesList);

    // put body content into storage
    localStorage['collectionBody'] = JSON.stringify(storedBody)
  }

  // deletes current collection and returns items to main pane. 
  var deleteCollection = function() {
    
    // variables to hold information about the active tab
    var activeTab = $('.collections .active').children().attr('class');
    var activeTabIndex = activeTab[activeTab.length - 1]
    
    // delete function will only run if there is an active tab, which is the tab that it deletes
    if ($('.collections .active') !== []) {

      // remove all HTML elements associated with the active tab
      $($(document.getElementById(activeTab)).children()).remove();
      $(document.getElementById(activeTab)).remove();
      $($("."+activeTab).parent()).remove();
      $("."+activeTab).remove();

      // shift list of all tabs' content down by one to account for a deletion in the middle of the list of tabs
      for (var i = activeTabIndex; i < maxCollections; i++) {
        storedBody["sortable"+(i)] = storedBody["sortable"+parseInt(i+1)]
      }

      // remove deleted collection name from storedNamesList
      storedNamesList.splice(activeTabIndex, 1)

    } 

  }

  // takes two arguments to allow for more than one comments box to appear
  // num is used to dynamically create tables, and is used here to modify them
  // URL is the URL associated with the comments table, allow us to access the comments list
  // for that specific comments table.
  var fillComments = function(num, URL){
      console.log(URL)
      var value = $('.category'+num).val();
      console.log(value)
      var commentsList = getEverything().getDisplayedColumns(URL)
      console.log(commentsList)
      $('.commentsTable'+num).empty()
      for (var i=0;i<commentsList.length;i++){
          if (commentsList[i][0] == value){
              for (var j=0;j<commentsList[i].length;j++){
                  if (j==0){
                       $('.commentsTable'+num).append('<tr class="comments"><td clas="comments"><b>'+commentsList[i][j]+'</b></td></tr>')
                  }
                  else{
                      $('.commentsTable'+num).append('<tr class="comments"><td clas="comments">'+commentsList[i][j]+'</td></tr>')
                  }
              }
                                             
          }
      
      }
  }

  // shows modal with URL-specific information, 'this' refers to the overlay div that was clicked on
  var showSingleModal = function() {

    $('#myModal .modal-body').empty();
    $('#myModal .modal-footer').empty();

    var URL = $(this).parent().parent().find('iframe').attr('src');
    var quoteURL = "'"+URL+"'"
    var commentsList = getEverything().getDisplayedColumns(URL)
    var commentsBox = $('<div class= "commentsBox"><select class="category0"></select><button class = "fill-comments btn" onClick = "examplesInterface.fillComments(0, '+quoteURL+')">View</button></div>')
    var commentsDisplay = $('<div class= "commentsDisplay"><table class="title"></table><table class="commentsTable0 table table-striped"><tbody><tr><td>"examples"</td></tr></tbody></table></div>')
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+quoteURL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    
    $('#myModal .modal-body').append(iframeDiv).append(commentsBox).append(commentsDisplay)
    $('#myModal .modal-footer').append(closeButton, URLbutton)
    for (var i=0;i<commentsList.length;i++){
        var title = commentsList[i][0]
        $('.category0').append('<option value="'+title+'">'+title+'</option>')
    }
  }

  // figure out a way to avoid modal breakage problem
  var showCollectionModal = function() {
    if ($('.collections .active').text() !== "") {
      $('#collectionModal .modal-body').empty();
      $('#collectionModal .modal-footer').empty();
      $('#collectionModalLabel').text($('.collections .active').text())

      selectionList = $('.active .group li')

      for (var i = 0; i < selectionList.length; i++) {
        var URL = $($('.active .group li iframe')[i]).prop('src')
        var quoteURL = "'"+URL+"'"
        var exampleAndComments = $('<div class="commented-iframe"></div>')
        var exampleDiv = $('<div class="iframe"></div>')
        var example = $(selectionList[i]).html();
        exampleDiv.append(example);
        exampleAndComments.append(exampleDiv);

        var commentsList = getEverything().getDisplayedColumns(URL)

        var commentsBox = $('<div class= "commentsBox"><select class="category'+i+'"></select><button class = "fill-comments btn" onClick = "examplesInterface.fillComments('+i+', '+quoteURL+')">View</button></div>')
        var commentsDisplay = $('<div class= "commentsDisplay"><table class="title"></table><table class="commentsTable'+i+' table table-striped"><tbody><tr><td>"examples"</td></tr></tbody></table></div>')
        exampleAndComments.append(commentsBox).append(commentsDisplay)

        $('#collectionModal .modal-body').append(exampleAndComments)

        for (var j=0;j<commentsList.length;j++){
          var title = commentsList[j][0]
          $('.category'+i).append('<option value="'+title+'">'+title+'</option>')
        }
      }
      $('.commented-iframe a').attr("data-target", "undefined")
    }
  }



  ///////// setup functions
	var setupExamples = function(div) {
 
    // make modal to view larger images of examples
    var singleModal = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
               +  '<div class="modal-header">'
               +    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
               +    '<h3 id="myModalLabel">Modal header</h3>'
               +  '</div>'
               +  '<div class="modal-body">'
               +  '</div>'
               +  '<div class="modal-footer">'
               +  '</div>'
               +'</div>';

    div.append(singleModal);
    
    // create iframe, overlay, and link to modal for each URL
    for (i=1;i<URLList.length;i++) {
			
      var link = $('<a data-toggle="modal" data-target="#myModal"></a>')
      var li = $('<li class = "iframe ui-state-default">')
			var overlay = $('<div class="overlay"></div>')
			var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+URLList[i]+' style="-webkit-transform:scale(0.25);-moz-transform-scale(0.25);">')

			link.append(overlay)
      overlay.on("click", showSingleModal)
      li.append(link, iframe)
			div.append(li)

      $('.iframe').draggable({ 
        helper: "clone",
        connectToSortable: '.group'
      });

		}
	}
	exports.setupExamples = setupExamples;

  // set up area for collections of select examples
  var setupSelectionPane = function(div) {

    // html elements for selection pane skeleton
    var buttons = $('<div class="description"><button class="btn new-collection">New Collection</button><button class="btn delete-collection">Delete Collection</button><button class="btn save-collection">Save</button></div>');
    var collectionNaming = $('<div class="collection-name"><input type="text" class="collection-name-input" placeholder="Collection name"></input><button class="btn name-submit">Create</button></div>');
    var collectionTabs = $('<div class="tabbable collection-tabs"><ul class="nav nav-tabs collections"></ul><div class="collections-content tab-content"></div></div>');
    var alert = $('<div class="collection-alert alert alert-error">Please enter a different name.</div>')
    var showLarger = $('<div><button class="btn show-larger" data-toggle="modal" data-target="#collectionModal">Show Larger</button></div>');
    collectionNaming.append(alert)

    div.append(buttons, collectionNaming, showLarger, collectionTabs);

    // modal for showing collections
    var collectionModal = '<div id="collectionModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
               +  '<div class="modal-header">'
               +    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
               +    '<h3 id="collectionModalLabel">You should select a collection.</h3>'
               +  '</div>'
               +  '<div class="modal-body">'
               +  '</div>'
               +  '<div class="modal-footer">'
               +  '</div>'
               +'</div>';

    div.append(collectionModal);

    // check localStorage for collections, if they exist, use them
    if (localStorage['collection'] !== undefined) {
      
      namesList = JSON.parse(localStorage['collection']);

      for (var i = 0; i < namesList.length; i++) {
          createCollection(namesList[i]);
      }


      if (localStorage['collectionBody'] !== undefined) {
        tabsList = $('.collections-content').find('.group').map( function() {
          return this.id
        }).get();

        bodyList = JSON.parse(localStorage['collectionBody']);


        for (var i = 0; i < tabsList.length; i++) {
            $('#'+tabsList[i]).html(bodyList[tabsList[i]]);
            $('li').css('display', 'inline')
            $('.ui-sortable-placeholder').css('display', 'none')
            $(".overlay").on("click", showSingleModal)
            storedBody[tabsList[i]] = bodyList[tabsList[i]]
        }
      }
    }

    // attach click handlers to buttons + enter handler to input box
    $('.new-collection').on("click", showNamePrompt);
    $('.delete-collection').on("click", deleteCollection);
    $('.save-collection').on("click", saveCollections);
    $('.name-submit').on("click", function() {
        createCollection($('.collection-name-input')[0].value);
    });
    $('.collection-name-input').keydown(function(event){
        if(event.keyCode == 13) {
          $('.name-submit').click();
        }
    });
    $('.show-larger').on("click", showCollectionModal);
  }
  exports.setupSelectionPane = setupSelectionPane;

  // set up both main and selection panes within a fluid row
  var setupInterface = function(div) {

    var main = $('<div class="span9 main-grouping"><ul id="sortable-main" class="connected-main"></ul></div>');
    var select = $('<div class="span3 select-grouping"></div>');

    div.append(main, select);

    $('#sortable-main').droppable({
      drop: function(event, ui) {
        if ($(ui.draggable.prop('parentNode')).attr('id') !== "sortable-main") {
          var activeTab = $('.collections .active').children().attr('class');
          var activeTabIndex = activeTab[activeTab.length - 1]

          $(ui.draggable).remove();
          storedBody["sortable"+activeTabIndex] = $("#sortable"+activeTabIndex).html()
        }
      }
    });

    // add examples to main pane and functionality to selection pane
    setupExamples($('#sortable-main'));
    setupSelectionPane($('.select-grouping'));
  }
  exports.setupInterface = setupInterface;
  exports.fillComments = fillComments
	return exports;
})();

var JSONdata 
    
    
$.getJSON(JSONURL, function(data) {
        JSONdata=data
    }).done(function(){
                      getEverything().getURLList();

                      $('.example-holder').each(function() {
		                      examplesInterface.setupInterface($(this));
	                    });
                      

      })

