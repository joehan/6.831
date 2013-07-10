var items = {}
var valueHolder
var URLList = []
var data = $.getJSON( 'https://spreadsheets.google.com/feeds/cells/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
            
          return data
    });

var getInfo = function(){
    
    var values = $.parseJSON(data.response).feed.entry
    console.log(values)
    valueHolder= values
    return values
          
    };

    
var parseData = function(){
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
            console.log(items)
}


var findURLColumn = function(){
    for (i=0;i<items[1].length;i++){
        if (items[1][i] == 'URL'){
            return i;
        }
    }
}

var getURLList = function(){
    var columnNum = findURLColumn();
    for (key in items){
        URLList.push(items[key][columnNum])
    }
}