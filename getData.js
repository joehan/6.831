var items = {};

var getRowContents = function(){    $.getJSON('https://spreadsheets.google.com/feeds/list/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
      var items = {};
      for (i=0;i<data.feed.entry.length;i++){
          var valuesString = data.feed.entry[i].content.$t
          
          var url = valuesString.split('url: ')[1].split(',')[0];
          var infoArrayString ='{'+valuesString+'}'
          if (items[url]==undefined){
            items[url] = [infoArrayString]
          }
          else{
            items[url].push(infoArrayString)
          }
      }
    console.log(items)
    $('.results').append(items)
    return items
      
    });
}


var parseInfo = function(infoArrayString){
    
    
}
getRowContents()
