var getURLVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    if (vars['googleKey']==undefined){
        window.location = 'frontend.html'
    }
    return vars;
}
var googleKey = getURLVars()['googleKey']
var category = getURLVars()['category'].split(',')
var displayed = getURLVars()['displayed'].split(',')
displayedColumns = getEverything().letterArrayToNumber(displayed)
categoryColumns = getEverything().letterArrayToNumber(category)


var JSONURL = 'https://spreadsheets.google.com/feeds/cells/'+googleKey+'/oD6/public/basic?alt=json'

// contains functions to set up main collection area and selection pane

// to-do: move larger view of collections to separate tab in main window
// fix layout of larger collection view
// show all comments at once
// maxe delete button an "x" on the tabs themselves.
// look into parse as a storage thingy.
var examplesInterface = (function() {

  Parse.initialize("EAZLne6WusMuwh67shifh4saiDh4Y9q5rVYcgPrG", "Spq8SBS6pChLouqFmJY4bDgiRVAHtDh0luJzoMiQ");

  var CollectionData = Parse.Object.extend('collectionData');
  var collectionData = new CollectionData
  collectionData.set('source', 'Bad Websites')

  collectionData.save(null, {
          error: function(collectionData, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and description.
            alert('Failed to create new object, with error code: ' + error.description);
          }
        });

  // variables for storage of collections
  var storedNamesList = [];
  var storedBody = {};

  // arbitrary max number of collections, changable
  var maxCollections = 5;

  // holds functions and variables accessible outside of the module
	var exports = {};

  // createCollection and deleteCollection are used for the selection pane

  // makes new collection in a tabbed list and connects it to main group
  var createCollection = function(name) {

    // gives collection index #
    var collectionNumber = $('.collections').children().length;
    var count = 1

    if (maxCollections  > collectionNumber) {

      while ($('.collection'+collectionNumber).length > 0) {
        collectionNumber += 1
        count += 1
      }

      storedNamesList.push(name);

      // resets collection name input area
      $('.collection-alert').css('visibility', 'hidden')
      $('.collection-name-input').val("")
      $('.collection-name').css("visibility", "hidden");

      // HTML skeleton for new collection body
      var newTab = $('<li><a class=collection'+collectionNumber+' href=#collection'+collectionNumber+' data-toggle="tab"><input class="tab-name-input" type="text" placeholder="'+name+'" style="border: none; box-shadow: none; background-color: transparent;"></input><button class="btn delete">×</button></a></li)');
      var newTabBody = $('<div id=collection'+collectionNumber+' class="tab-pane"></div>')
      var newSortable = $('<ul id="sortable'+collectionNumber+'" class="connected'+collectionNumber+' group"></ul>')
      newTabBody.append(newSortable);

      $('.collections').append(newTab);
      $('.collections-content').append(newTabBody);

      if (name !== "untitled") {
        $('.collection'+collectionNumber+' .tab-name-input').val(name);
      } else {
        $('.collection'+collectionNumber+' input').focus();
      }

      $('.collection'+collectionNumber+' .tab-name-input').keydown(function(event){
        if(event.keyCode == 13) {
          newName = $('.collection'+collectionNumber+' .tab-name-input').val();
          $('.collection'+collectionNumber+' .tab-name-input').blur();
          storedNamesList.splice(collectionNumber-count, 1, newName);
          saveCollections();
        }
      });

      $('.collection'+collectionNumber+' .delete').on('click', function() {
          deleteCollection(this);
      })

      // bind drop function to any iframe dropped into the collection, needed because onclick handlers
      // unbind when the object is moved
      $('#sortable'+collectionNumber).sortable({
        stop: function(event, ui) {
          storedBody["sortable"+collectionNumber] = $("#sortable"+collectionNumber).html()
          var collection = $('.collection'+collectionNumber+' input').val()
          var content = $("#sortable"+collectionNumber).html()
          saveCollections();
        }
        }).disableSelection().droppable({
        drop: function(event, ui) {
          $(".overlay").on("click", showSingleModal)
          storedBody["sortable"+collectionNumber] = ui.draggable.parent().html()
          saveCollections();
        }
        });
    }
  }

  // var saveName = function(name) {
  //   var savedName = new CollectionName;
  //   savedName.set('name', name)
  //   savedName.save(null)
  // }

  // var saveContent = function(collection, content) {
  //   var savedContent = new CollectionContent
  //   var data = {}
  //   data[collection] = content
  //   savedContent.set('data', data)
  //   savedContent.save(null)
  // }

  // puts content of collections onto Parse
  var saveCollections = function() {
    collectionData.save(null, {
      success: function() {
        collectionData.set('collection', storedNamesList)
        collectionData.set('collectionBody', storedBody)
      }
    })
    console.log(storedNamesList)
    console.log(storedBody)
  }

  // deletes current collection and returns items to main pane. 
  var deleteCollection = function(button) {
    
    // variables to hold information about the active tab
    var collection = $(button).parent().attr('class')
    var collectionIndex = $('.'+collection).parent().index()

    // remove all HTML elements associated with the active tab
    $($(document.getElementById(collection)).children()).remove();
    $(document.getElementById(collection)).remove();
    $($("."+collection).parent()).remove();
    $("."+collection).remove();

    // shift list of all tabs' content down by one to account for a deletion in the middle of the list of tabs
    for (var i = collectionIndex; i < maxCollections; i++) {
      storedBody["sortable"+(i)] = storedBody["sortable"+parseInt(i+1)];
    }

    // remove deleted collection name from storedNamesList
    storedNamesList.splice(collectionIndex - 1, 1);
    saveCollections();
  }

  // takes two arguments to allow for more than one comments box to appear
  // num is used to dynamically create tables, and is used here to modify them
  // URL is the URL associated with the comments table, allow us to access the comments list
  // for that specific comments table.
  var fillComments = function(num, URL){
      var value = $('.category'+num).val();
      var commentsList = getEverything().getDisplayedColumns(URL)
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
    var baseURL = URL.split('/')[2]
    var commentsList = getEverything().getDisplayedColumns(URL)
    var commentsBox = $('<div class= "commentsBox"><select class="category0"></select><button class = "fill-comments btn" onClick = "examplesInterface.fillComments(0, '+quoteURL+')">View</button></div>')
    var commentsDisplay = $('<div class= "commentsDisplay"><table class="title"></table><table class="commentsTable0 table table-striped"><tbody></tbody></table></div>')
    var iframeDiv = $('<div class="modal-iframe-holder"></div>')
    var modalIframe = $('<iframe class="modal-iframe" sandbox="" width="1000" height="750" src='+URL+' style="-webkit-transform:scale(0.5);-moz-transform-scale(0.5);">')
    var URLbutton = $('<button class="btn btn-primary" onclick="window.open('+quoteURL+');">Visit Site</button>')
    var closeButton = $('<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>')
    iframeDiv.append(modalIframe)
    $('#myModalLabel').text(baseURL)
    $('#myModal .modal-body').append(iframeDiv).append(commentsBox).append(commentsDisplay)
    $('#myModal .modal-footer').append(closeButton, URLbutton)
    for (var i=0;i<commentsList.length;i++){
        var title = commentsList[i][0]
        $('.category0').append('<option value="'+title+'">'+title+'</option>')
    }
  }

  // figure out a way to avoid modal breakage problem
  var showCollectionModal = function() {
    if ($('.collections .active').val() !== "") {
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
        var commentsDisplay = $('<div class= "commentsDisplay"><table class="title"></table><table class="commentsTable'+i+' table table-striped"><tbody></tbody></table></div>')
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
    var buttons = $('<button class="btn save-collection">Save</button></div>');
    var collectionTabs = $('<div class="tabbable collection-tabs"><ul class="nav nav-tabs collections"><li><a href="#"><i class="new-tab icon-plus"></i></a></li></ul><div class="collections-content tab-content"></div></div>');
    var showLarger = $('<div><button class="btn show-larger" data-toggle="modal" data-target="#collectionModal">Show Larger</button></div>');

    div.append(buttons, showLarger, collectionTabs);

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

    var query = new Parse.Query(CollectionData);
    var data
    query.equalTo("source", "Bad Websites");
    query.find({
      success: function(results) {
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) { 
          var object = results[i];
          if (object.get('collection') !== undefined) {
            data = object
            break
          }
        }
          if (data !== undefined) {
      
            namesList = data.get('collection')

            for (var i = 0; i < namesList.length; i++) {
                createCollection(namesList[i]);
            }


            if (data.get('collectionBody') !== undefined) {
              tabsList = $('.collections-content').find('.group').map( function() {
                return this.id
              }).get();

              bodyList = data.get('collectionBody');

              for (var i = 0; i < tabsList.length; i++) {
                  $('#'+tabsList[i]).html(bodyList[tabsList[i]]);
                  $('li').css('display', 'inline')
                  $('.ui-sortable-placeholder').css('display', 'none')
                  $(".overlay").on("click", showSingleModal)
                  storedBody[tabsList[i]] = bodyList[tabsList[i]]
              }
            }
            console.log(storedBody)
            saveCollections();
          }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });

    // attach click handlers to buttons + enter handler to input box
    $('.new-tab').on("click", function() {
        createCollection("untitled")
    });
    $('.save-collection').on("click", saveCollections);
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
  var fillFilterBar = function(){
      var selectDict={}
      var col = categoryColumns[0];
      for (var key in URLDict){
          for (var j=0;j<URLDict[key].length;j++){
              if (key=='http://URL'){
              }
              else if (selectDict[URLDict[key][j][col]]==undefined){
                  selectDict[URLDict[key][j][col]] = 1
              }
              else{
                  selectDict[URLDict[key][j][col]] += 1
              }
          }    
      }
      for (key in selectDict){
          $('.filter').append('<option>'+key+'</option>')
      }
  }
  
  var handleFilterBar = function(){
      var filterValue = $('.filter').val().split(':')[0]
      var newList = getEverything().URLbySearch(filterValue)
      if (filterValue == 'All'){
          getEverything().getURLList()
          $('.connected-main').empty()
          setupExamples($('.connected-main'))
      }
      else{
          URLList = newList
          $('.connected-main').empty()
          setupExamples($('.connected-main'))
      }
      
  }
  
    exports.setupInterface = setupInterface;
    exports.fillComments = fillComments;
    exports.fillFilterBar= fillFilterBar;
    exports.handleFilterBar = handleFilterBar;
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
                      examplesInterface.fillFilterBar()

      })

