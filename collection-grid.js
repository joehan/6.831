var items = {}
var valueHolder
var URLList = []
                       
                       
function getEverything(){
    
    var getValues = function(){
        
        var values = JSONdata.feed.entry
        console.log(values)
        valueHolder= values
        return values
              
        };
    
        
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
        console.log(testList)
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


var iframeMaker = (function() {

	exports = {}

	var setup = function(div) {
		for (i=1;i<URLList.length;i++) {
			var li = $('<li class = "iframe ui-state-default">')
			var overlay = $('<div class="overlay"></div>')
			var iframe = $('<iframe class="body-iframe" sandbox="" width="1000" height="750" src='+URLList[i]+' style="-webkit-transform:scale(0.24);-moz-transform-scale(0.25);">')
			// var buttons = $('<div class="buttons"><button class="one">1</button><button class="two">2</button><button class="three">3</button></div>')
			// overlay.append(buttons)
			li.append(overlay, iframe)
			div.append(li)
		}
	}
	exports.setup = setup
	return exports
})();

var JSONdata 
    
    
$.getJSON( 'https://spreadsheets.google.com/feeds/cells/0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE/od6/public/basic?alt=json', function(data) {
        JSONdata=data
    }).done(function(){getEverything().getURLList();
                       console.log(items);
                       $("#sortable1").each(function() {
		                      iframeMaker.setup($(this));
	                   })
                      })

//$(document).ready(function() {
//	$("#sortable").each(function() {
//		iframeMaker.setup($(this));
//	});
//});