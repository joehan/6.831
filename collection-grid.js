// contains functions to set up main collection area and selection pane
var examplesInterface = (function() {

  var storedNamesList = [];
  var storedBody = {};
  var maxCollections = 4;

	var exports = {};

  ///////////// showNamePrompt, createCollection, and deleteCollection are used for the selection pane

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

  // makes new collection in a tabbed list and connects it 
  var createCollection = function(name) {

    // variables to hold identifying information for new colleciton
    var collectionNumber = $('.collections').children().length;
    if (storedNamesList.indexOf(name) == -1) {
      storedNamesList.push(name);

      // creates collection if user entered a name
      if (name !== '') {
        $('.collection-alert').css('visibility', 'hidden')
        $('.collection-name-input').val("")
        $('.collection-name').css("visibility", "hidden");

        var newTab = $('<li><a class=collection'+collectionNumber+' href=#collection'+collectionNumber+' data-toggle="tab">'+name+'</a></li)');
        var newTabBody = $('<div id=collection'+collectionNumber+' class="tab-pane"></div>')
        var newSortable = $('<ul id="sortable'+collectionNumber+'" class="connected'+collectionNumber+' group"></ul>')
        newTabBody.append(newSortable);

        $('.collections').append(newTab);
        $('.collections-content').append(newTabBody)

        $('#sortable'+collectionNumber).sortable().disableSelection().droppable({
          drop: function(event, ui) {
            $(".overlay").on("click", showModal)
            storedBody["sortable"+collectionNumber] = ui.draggable.parent().html()

          }
        });
      } 
    } else {
        $('.collection-alert').css('visibility', 'visible')
    }
  }

  var saveCollections = function() {
    localStorage['collection'] = JSON.stringify(storedNamesList);
    localStorage['collectionBody'] = JSON.stringify(storedBody)
  }

  // deletes current collection and returns items to main pane. 
  var deleteCollection = function() {
    
    var activeTab = $('.collections .active').children().attr('class');
    var activeTabIndex = activeTab[activeTab.length - 1]
    
    if ($('.collections .active') !== []) {

      $($(document.getElementById(activeTab)).children()).remove();
      $(document.getElementById(activeTab)).remove();
      $($("."+activeTab).parent()).remove();
      $("."+activeTab).remove();

      for (var i = activeTabIndex; i < maxCollections; i++) {
        storedBody["sortable"+(i)] = storedBody["sortable"+(i+1)]
      }

      storedNamesList.splice(activeTabIndex, 1)

    } 

  }

  // shows modal with URL-specific information, 'this' refers to the overlay div that was clicked on
  var commentsList
    
    var fillComments = function(){
        var value = $('.category').val();
        $('.commentsTable').empty()
        for (var i=0;i<commentsList.length;i++){
            if (commentsList[i][0] == value){
                for (var j=0;j<commentsList[i].length;j++){
                    if (j==0){
                         $('.commentsTable').append('<tr class="comments"><td clas="comments"><b>'+commentsList[i][j]+'</b></td></tr>')
                    }
                    else{
                        $('.commentsTable').append('<tr class="comments"><td clas="comments">'+commentsList[i][j]+'</td></tr>')
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
			var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+URLList[i]+' style="-webkit-transform:scale(0.25);-moz-transform-scale(0.25);">')

			link.append(overlay)
      overlay.on("click", showModal)
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
    var alert = $('<div class="collection-alert alert alert-error">Please enter a name.</div>')
    collectionNaming.append(alert)

    div.append(buttons, collectionNaming, collectionTabs);

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
            $(".overlay").on("click", showModal)
            storedBody[tabsList[i]] = bodyList[tabsList[i]]
        }
      }
    }

    // attach click handlers to buttons + enter handler to input box
    $('.new-collection').on("click", showNamePrompt);
    $('.delete-collection').on("click", deleteCollection);
    $('.save-collection').on("click", saveCollections);
    $('.name-submit').on("click", function() {
        createCollection($('.collection-name-input')[0].value)
    });
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

    $('#sortable-main').droppable({
      drop: function(event, ui) {
        if ($(ui.draggable.prop('parentNode')).attr('id') !== "sortable-main") {
          $(ui.draggable).remove();
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
    
    
$.getJSON( 'https://spreadsheets.google.com/feeds/cells/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
        JSONdata=data
    }).done(function(){
                      getEverything().getURLList();

                      $('.example-holder').each(function() {
		                      examplesInterface.setupInterface($(this));
	                    });
                      

      })

