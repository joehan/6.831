var items = {}
var valueHolder
var URLList
var URLDict = {}
                       
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
              if (items[rowNumber] == undefined){
                  items[rowNumber] = [valueHolder[i].content.$t]
              }
              else{
                  items[rowNumber].push(valueHolder[i].content.$t)
              }  
          }
    }
    
    //findColumn takes the name of a column in the Google docs spreadsheet, and return what column(and therefore, what array index) it is in. It currently is used to find URLs from a column named 'URL'.
    var findColumn = function(columnName){
        for (i=0;i<items[1].length;i++){
            if (items[1][i] == columnName){
                return i;
            }
        }
    }
   
    
    //addProtocol take a URL and adds 'http://' to the start, if there is no protocol there already.
    var addProtocol = function(URL){
        if (URL.slice(0,4)!= 'http'){
            URL = 'http://'+URL
        }
        return URL
    }
    
    //makeURlDict is used to create the dictionary from which the grid of sites is created. It outputs an associative array, with URLs as the key and the rest of the google docs info as the value.
    var makeURLDict = function(){
        parseData()
        for (var key in items){
            var newKey = addProtocol(items[key][findColumn('URL')])
            if (URLDict[newKey]==undefined){
                URLDict[newKey]=[items[key]]
            }
            else{
                 URLDict[newKey].push(items[key])
            }
            
        }
    }
    
    //getURLlist gets a dictionary of the keys in URL dict. it is curently used to tape together the front and back ends.
    var getURLList = function(){
        makeURLDict()
        URLList= Object.keys(URLDict)
        
    }
    
    //
    var getColumnContents = function(URL, columnNum){
        return URLDict[URL][0][columnNum]
    }
                                    
    
    return {'getValues':getValues, 'parseData':parseData, 'findColumn':findColumn, 'getURLList':getURLList, 'makeURLDict':makeURLDict, 'getColumnContents':getColumnContents}
}