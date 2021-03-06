var builtExamples = 1
var modalBuilt
var selectDict = {}
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
var URLCol = getURLVars()["URLCol"].split(",")
displayedColumns = getEverything().letterArrayToNumber(displayed)
categoryColumns = getEverything().letterArrayToNumber(category)
URLColumn = getEverything().letterArrayToNumber(URLCol)
console.log(displayedColumns, categoryColumns, URLColumn)


var JSONURL = 'https://spreadsheets.google.com/feeds/cells/'+googleKey+'/oD6/public/basic?alt=json'

// contains functions to set up main collection area and selection pane

var examplesInterface = (function() {
  
  // Parse key to allow persistent storage
  Parse.initialize("EAZLne6WusMuwh67shifh4saiDh4Y9q5rVYcgPrG", "Spq8SBS6pChLouqFmJY4bDgiRVAHtDh0luJzoMiQ");

  // initialize Parse objects for storage - CollectionName stores collection names
  // and CollectionContent stores individual examples
  var CollectionName = Parse.Object.extend('collectionName')
  var CollectionContent = Parse.Object.extend('collectionContent')

  // initialize query objects for delete functions
  var itemQuery = new Parse.Query(CollectionContent)
  var collectionQuery = new Parse.Query(CollectionName)

  // variables for storage of Parse IDs - used for delete functions
  var URLtoID = {};
  var nameToID = {};
  var nameToContentIDs = {};

  // arbitrary max number of collections, changable
  // TO DO - figure out what to do with this now that multiple users can edit
  var maxCollections = 5;

  // holds functions and variables accessible outside of the module
  var exports = {};

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

      // HTML skeleton for new collection body
      var newTab = $('<li><a class=collection'+collectionNumber+' href=#collection'+collectionNumber+' data-toggle="tab"><input class="tab-name-input" type="text" placeholder="'+name+'" style="border: none; box-shadow: none; background-color: transparent;"></input><button class="btn delete">×</button></a></li)');
      var newTabBody = $('<div id=collection'+collectionNumber+' class="tab-pane"></div>')
      var newSortable = $('<ul id="sortable'+collectionNumber+'" class="connected'+collectionNumber+' group"></ul>')
      newTabBody.append(newSortable);

      // append HTML skeleton to collection holder
      $('.collections').append(newTab);
      $('.collections-content').append(newTabBody);

      // if tab is created from storage, give it a class with its name to make it more easily accessible
      // to add items to.
      if (name !== "untitled") {
        $('.collection'+collectionNumber+' .tab-name-input').val(name);
        var nameClass = name.replace(/\s+/g,"");
        $('#sortable'+collectionNumber).addClass(nameClass)
      } else {
        $('.collection'+collectionNumber+' input').focus();
      }

      // event handler for name input box, hitting enter saves the name to storage
      $('.collection'+collectionNumber+' .tab-name-input').keydown(function(event){
        if(event.keyCode == 13) {
          newName = $('.collection'+collectionNumber+' .tab-name-input').val();
          $('.collection'+collectionNumber+' .tab-name-input').blur();
          saveName(newName);
          $('.active').removeClass('active');
          $('.collection'+collectionNumber).parent().addClass('active');
          $('#collection'+collectionNumber).addClass('active');

        }
      });

      // clicking the X button deletes the collection
      // TO DO - add confirmation popup
      $('.collection'+collectionNumber+' .delete').on('click', function() {
          deleteCollection(this);
      })

      if (count == 1) {
        $($('.collections').children()[1]).addClass('active')
        $('#collection'+collectionNumber).addClass('active')
        count += 1
      }

      // bind drop function to any iframe dropped into the collection, needed because onclick handlers
      // unbind when the object is moved
      $('#sortable'+collectionNumber).sortable().disableSelection().droppable({
        drop: function(event, ui) {
          console.log('dropped!')
          $(".overlay").on("click", showSingleModal)
          var collection = $('.collection'+collectionNumber+' input').val().replace(/\s+/g,"")
          var tempcontent = $(ui.draggable[0]).clone()
          var URL = $(ui.draggable[0]).find('iframe').prop("src")
          var tempparent = $('<div class = "temp"></div>')
          tempparent.append(tempcontent)
          var content = tempparent.html()
          saveContent(collection, content, URL);
          $('.temp').remove()
        }
        });
    }
  }

  // saves given name to Parse list of collection names
  var saveName = function(name) {
    var savedName = new CollectionName;
    savedName.set('source', googleKey)
    savedName.set('name', name)
    savedName.save(null)
  }

  // saves a single example to Parse, collection is the collection the content belongs to, content is
  // the HTML of the example.
  var saveContent = function(collection, content, URL) {
    var savedContent = new CollectionContent
    savedContent.set('source', googleKey)
    
    var data = {}
    data[collection] = content
    savedContent.set('data', data)
    savedContent.save(null, {
      success: function(savedContent) {
        var ID = savedContent.id;
        if (URLtoID[URL] !== undefined) {
          URLtoID[URL].push(ID);
        } else {
          URLtoID[URL] = [ID];
        }
      }
    })
  }

  // deletes a single item out of Parse
  var deleteItem = function(ui) {
    // URL of deleted example
    var URL = $(ui.draggable[0]).find('iframe').prop('src')

    // name of collection that the example belonged to
    var collection = $('.collections .active input').val()

    // delete all examples in the collection that have that URL
    if (URLtoID[URL] !== undefined) {
      for (var i = 0; i < URLtoID[URL].length; i++) {
        var ID = URLtoID[URL][i]
        itemQuery.get(ID, {
          success: function(collectionContent) {
            if (collection == Object.keys(collectionContent.get('data'))[0]) {
              collectionContent.destroy()
            }
          }
        })
      }
    }
    // delete the example DOM element
    $(ui.draggable).remove();

  }

  // deletes current collection and returns items to main pane. 
  var deleteCollection = function(button) {
    
    // variables to hold information about the active tab
    var collection = $(button).parent().attr('class')
    var collectionName = $(button).parent().find('input').val()
    var ID = nameToID[collectionName]
    var collectionIndex = $('.'+collection).parent().index()

    // remove all HTML elements associated with the active tab
    $($(document.getElementById(collection)).children()).remove();
    $(document.getElementById(collection)).remove();
    $($("."+collection).parent()).remove();
    $("."+collection).remove();

    // delete collection and all associated content out of Parse
    for (var i = 0; i < nameToContentIDs[collectionName].length; i++) {
      itemQuery.get(nameToContentIDs[collectionName][i], {
        success: function(item) {
          item.destroy()
        }
      })
    }
    collectionQuery.get(ID, {
      success: function(collectionName) {
        collectionName.destroy()
      }
    })
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
      $('#collectionModalLabel').text($('.collections .active input').val())

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
  var setupExamples = function(div, galleryURLList) {
 
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

    if (modalBuilt ==undefined){
        div.append(singleModal);
        modalBuilt=true;
    }
    
   // create iframe, overlay, and link to modal for each URL
   console.log(galleryURLList)
    for (i=1; i<galleryURLList.length; i++) {
       builtExamples+=1
       var link = $('<a data-toggle="modal" data-target="#myModal"></a>')
       var li = $('<li class = "iframe ui-state-default">')
       var overlay = $('<div class="overlay"></div>')
       var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+galleryURLList[i]+' style="-webkit-transform:scale(0.25);-moz-transform-scale(0.25);">')

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

  var buildCollectionsFromParse = function() {
    // code to pull existing collections from Parse
    var namesList = []
    var nameQuery = new Parse.Query(CollectionName);
    var currentCollections = $('.tab-name-input').map(function(tab) {
      return $(this).val();
    }).get()

    // find all collections connected to this specific google doc
    nameQuery.equalTo('source', googleKey);
    nameQuery.find({
      success: function(nameResults) {

        var contentQuery = new Parse.Query(CollectionContent);

        // find all content connected to this specific google doc
        var content = {}
        contentQuery.equalTo('source', googleKey);
        contentQuery.find({

          success: function(contentResults) {
            
            // create a list of collection names and begin to store Parse IDs
            for (var i = 0; i < nameResults.length; i++) {
              var object = nameResults[i];
              if (object.get('name') !== undefined && namesList.indexOf(object.get('name') == -1)) {
                namesList.push(object.get('name'));
                nameToID[object.get('name')] = object.id
                nameToContentIDs[object.get('name')] = []
              }
            }

            var newCollections = []
            for (var i = 0; i < namesList.length; i++) {
              if (currentCollections.indexOf(namesList[i]) == -1) {
                newCollections.push(namesList[i])
              }

            }

            // create a collection for each name in newCollections
            for (var i = 0; i < newCollections.length; i++) {
                createCollection(newCollections[i]);
            }

            // code to fill content
            for (var i = 0; i < contentResults.length; i++) {
              
              var object = contentResults[i]
              if (object.get('data') !== undefined) {
                
                for (var name in object.get('data')) {
                  var currentURLs = $('.'+name).find('iframe').map(function(){return $(this).prop('src')}).get()
                  var URL = $(object.get('data')[name]).find('iframe').prop('src')
                  if (content[name] !== undefined && object.get('data')[name] !== undefined) {
                    if (content[name].indexOf(URL) == -1 && currentURLs.indexOf(URL) == -1) {
                      content[name] += object.get('data')[name];
                      URLtoID[URL] = [object.id]
                    } else {
                      if (URLtoID[URL] == undefined){
                        URLtoID[URL] = [];
                      }
                      URLtoID[URL].push(object.id)
                    }
                  } else {
                    if (currentURLs.indexOf(URL) == -1) {
                      content[name] = object.get('data')[name];
                    }
                    URLtoID[URL] = [object.id]
                  }
                  if (nameToContentIDs[name] == undefined) {
                    nameToContentIDs[name] = [object.id]
                  } else {
                    nameToContentIDs[name].push(object.id)
                  }
                }
              }
            }

            // insert content into collections
            for (var collection in content) {
              var currentHTML = $('.'+collection).html();
              $('.'+collection).html(content[collection]+currentHTML);
              $('li').css('display', 'inline');
              $('.ui-sortable-placeholder').css('display', 'none');
              $('.overlay').on("click", showSingleModal);
            }
          }
        })

      }
    })

  }

  // set up area for collections of select examples
  var setupSelectionPane = function(div) {

    // html elements for selection pane skeleton
    var collectionTabs = $('<div class="tabbable collection-tabs"><ul class="nav nav-tabs collections"><li><a href="#"><i class="new-tab icon-plus"></i></a></li></ul><div class="collections-content tab-content"></div></div>');
    var showLarger = $('<div><button class="btn show-larger" data-toggle="modal" data-target="#collectionModal">Show Larger</button></div>');

    div.append(showLarger, collectionTabs);

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

    updateCollections();

    // attach click handlers to buttons + enter handler to input box
    $('.new-tab').on("click", function() {
        createCollection("untitled")
    });
    // $('.save-collection').on("click", saveCollections);
    $('.collection-name-input').keydown(function(event){
        if(event.keyCode == 13) {
          $('.name-submit').click();
        }
    });
    $('.show-larger').on("click", showCollectionModal);
  }
  exports.setupSelectionPane = setupSelectionPane;

  var addGalleryInterface = function() {
    $(".connected-main").children().remove();
    var nameInput = $('<div>Gallery Name <input type="text" class="gallery-name"></input></div>')
    var keyInput = $('<div>Published Google Doc URL <input type="text" class="key"></input></div>')
    var URLColInput = $('<div>URL Column <input type="text" class="url"></input>Input the letter of the column that contains URLs.</div>')
    var categoryColInput = $('<div>Filter Column <input type="text" class="category"></input>Input the letter of the column that you wish to filter by.</div>')
    var displayedColInput = $('<div>Comment Columns <input type="text" class="displayed"></input>Which columns do you want to be viewable as comments? Input letters, split by commas with no spaces</div>')
    var submitButton = $('<button class="btn submit gallery-create">Create</button>')
    
    $('.connected-main').append(keyInput)
        .append(nameInput)
        .append(URLColInput)
        .append(categoryColInput)
        .append(displayedColInput)
        .append(submitButton)

    $('.gallery-create').on("click", createGallery)
  }

  //Working here.....next to do: be able to use given URL to bring up examples
  var createGallery = function() {
    var googleURL = $('.key').val()

    if(googleURL !== undefined) {
      var URLParts = googleURL.split("key=")[1]
      var googleKey= URLParts.split("#")[0].split('&')[0]
      console.log(googleKey)
      
      var galleryName = $('.gallery-name').val()
      var category = $('.category').val()
      var displayed = $('.displayed').val()
      var URLCol = $('.url').val()
      var dataURL = 'https://spreadsheets.google.com/feeds/cells/'+googleKey+'/oD6/public/basic?alt=json'

      $.getJSON(dataURL, function(data) {
        JSONdata=data
        }).done(function(){
          if (galleryName !== undefined && URLCol !== undefined){
            var galleryIndex = $('.galleries-holder').children().length
            $('.galleries-holder').append('<li class=gallery'+galleryIndex+'><a href="#">'+galleryName+'</a></li>')

            var URLQuery = '?googleKey='+googleKey+'&sheet=od6&category='+category+'&displayed='+displayed+'&URLCol='+URLCol+'&end=true'

            var galleryURLList = getEverything().getSpecifiedURLList(URLCol)
            console.log(galleryIndex)
            console.log(galleryURLList)

            $('.gallery'+galleryIndex+' a').on('click', function(){
              $('#sortable-main').children().remove()
              setupExamples($('#sortable-main'), galleryURLList)
            })
          }          
      })
    }
  }

  // set up both main and selection panes within a fluid row
  var setupInterface = function(div) {

    var galleries = $('<div class="span2 galleries"><div class="well sidebar-nav"><span class="gallery-label">Galleries</span><ul class="galleries-holder"></ul></div></div>')
    var addNew = $('<button class="btn addNew">Add new gallery</button>')
    var main = $('<div class="span8 main-grouping"><div class="space"></div><ul id="sortable-main" class="connected-main"></ul></div>');
    var select = $('<div class="span2 select-grouping"></div>');

    div.append(galleries, main, select);
    $(".galleries .sidebar-nav").append(addNew);
    $('.addNew').on("click", addGalleryInterface)

    // iframes dragged back to the main viewing pane will be deleted
    $('#sortable-main').droppable({
      drop: function(event, ui) {
        if ($(ui.draggable.prop('parentNode')).attr('id') !== "sortable-main") {
          deleteItem(ui);
          event.stopPropagation()
        }
      }
    });

    // add examples to main pane and functionality to selection pane
    setupExamples($('#sortable-main'), URLList);
    setupSelectionPane($('.select-grouping'));
  }

  var fillFilterBar = function(){
      
      var col = categoryColumns[0];
      for (var key in URLDict){
          for (var j=0;j<URLDict[key].length;j++){
              if (key=='http://URL'){
              }
              else if (selectDict[URLDict[key][j][col]]==undefined){
                  selectDict[URLDict[key][j][col]] = 1
                  $('.filter').append('<option>'+URLDict[key][j][col]+'</option>')
              }
          }    
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

  var updateCollections = function() {
    examplesInterface.buildCollectionsFromParse();
    setTimeout(updateCollections, 15000);
  }

    exports.buildCollectionsFromParse = buildCollectionsFromParse;
    exports.setupInterface = setupInterface;
    exports.fillComments = fillComments;
    exports.fillFilterBar= fillFilterBar;
    exports.handleFilterBar = handleFilterBar;
    return exports;
})();

var JSONdata 

var makeCall = function(){    
    $.getJSON(JSONURL, function(data) {
            JSONdata=data
        }).done(function(){
                        examplesInterface.fillFilterBar()
                        getEverything().getURLList();
    
                        $('.example-holder').each(function() {
                            examplesInterface.setupExamples($('#sortable-main'));
                        });
                        setTimeout(makeCall(), 15000);
    
          })
}

console.log(JSONURL)
$.getJSON(JSONURL, function(data) {
        JSONdata=data
    }).done(function(){
                      getEverything().getURLList();

                      $('.example-holder').each(function() {
                          examplesInterface.setupInterface($(this));
                      });
                      examplesInterface.fillFilterBar()
                      makeCall()
                      
      })


