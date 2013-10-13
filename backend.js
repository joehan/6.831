var items = {}
var valueHolder
var URLList
var URLDict = {}
var displayedColumns = []
var categoryColumns = []
var URLColumn = []

                       
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
        var values = getValues()
        items={}
        for (i=0;i<values.length;i++){
              var rowNumber = values[i].title.$t.slice(1)
              if (items[rowNumber] == undefined){
                  items[rowNumber] = [values[i].content.$t]
              }
              else{
                  items[rowNumber].push(values[i].content.$t)
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
    var makeURLDict = function(column){
        console.log(column)
        parseData()
        URLDict={}
        for (var key in items){
            var newKey = addProtocol(items[key][column])
            if (URLDict[newKey]==undefined){
                URLDict[newKey]=[items[key]]
            }
            else{
                var alreadyIn = false
                for (var i=0;i<URLDict[newKey].length;i++){
                    if (URLDict[newKey][i] == items[key]){
                        alreadyIn=true
                    }
                }
                if (alreadyIn==false){
                    URLDict[newKey].push(items[key])
                }
            }
            
        }
    }
    
    //getURLlist gets a dictionary of the keys in URL dict. it is curently used to tape together the front and back ends.
    var getURLList = function(){
        makeURLDict(URLColumn)
        URLList= Object.keys(URLDict)
        
    }

    var getSpecifiedURLList = function(column){
        makeURLDict(letterToNumber(column))
        return Object.keys(URLDict)
    }
    
    //getColumnContents is takes a URL and a column number. It searches through URLDict and pulls out each item in the given column that is associated with the given URL. It is used to help build the comments table/
    var getColumnContents = function(URL, columnNum){
        var contentList=[]
        contentList.push(items[1][columnNum])
        for (i=0;i<URLDict[URL].length;i++){
            contentList.push(URLDict[URL][i][columnNum])
        }
        return contentList
    }
    //getDisplayedColumns takes a URL and uses displayedColumns(which is determined from the URL query). It is the back end of the displayed information
    var getDisplayedColumns = function(URL){
        var displayedList = []
        for (var i=0;i<displayedColumns.length;i++){
            var colNum = displayedColumns[i]
            var colContents = getColumnContents(URL, colNum)
            displayedList.push(colContents)
        } 
        return displayedList
    }
    
    //letterToNumber is used to simplify the page where users input the info for the HTML query. It takes a letter and returns the corresponding index for that column.
    var letterToNumber = function(letter){
        var valueDict = {'a':0, 'b':1, 'c':2, 'd':3, 'e':4, 'f':5,'g':6,'h':7, 'i':8, 'j':9, 'k':10, 'l':11, 'm':12, 'n':13, 'o':14, 'p':15, 'q':16, 'r':17, 's':18, 't':19, 'u':20, 'v':21, 'w':22, 'x':23, 'y':24, 'z':25}
        return valueDict[letter]
        
    }
   //letterArrayToNumber calls letterToNumber iteratively to translate an array of letter to an array of the corresponding numbers.
    var letterArrayToNumber = function(array){
        var translatedArray = []
        for (i=0;i<array.length;i++){
            translatedArray.push(letterToNumber(array[i]))
        }
        return translatedArray
    }
    
    //URLbySearch takes a search term, and returns a list of URL's that have that search term in their category column. It is sed for filtering.
    var URLbySearch = function(searchTerm){
        var searchURLList = ['searchTerm']
        for (var i=0;i<categoryColumns.length;i++){
            for (var key in URLDict){
                var look=URLDict[key][i][categoryColumns[0]]
                if (look == searchTerm){
                    searchURLList.push(key)
                }
            }
        }
        return searchURLList
    }
                                    
    
    return {'getValues':getValues, 
            'parseData':parseData, 
            'findColumn':findColumn, 
            'getURLList':getURLList, 
            'makeURLDict':makeURLDict, 
            'getColumnContents':getColumnContents, 
            'getDisplayedColumns':getDisplayedColumns, 
            'URLbySearch':URLbySearch, 
            'letterArrayToNumber':letterArrayToNumber,
            'getSpecifiedURLList': getSpecifiedURLList}
}




