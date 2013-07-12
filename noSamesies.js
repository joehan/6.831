var removeDupes = function(){
    var testList = []
    for (i=0;i<URLList.length;i++){
        if (testList.indexOf(URLList[i])==-1)
            testList.push(URLList[i])
            
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
var getSpreadsheetInfo = function(URL){
    var infoList = []
    for (for key in items){
        if (items[key][getEverything.findURLColumn()] == URL){
            infoList.push(items[i])
        }
            
    }
    return infoList
}

var getComments = function(URL){
    commentsList = []
    var infoList = getSpreadsheetInfo(URL)
    for (i=0;i<infoList.length;i++){
        commentsList.push(infoList[i]['Comments'])
    }
}

