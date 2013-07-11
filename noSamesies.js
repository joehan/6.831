var removeDupes = function(URLList){
    testList = []
    for (i=0;i<URLList.length;i++){
        if (testList.indexOf(URLList[i])=-1)
            testList.push(URLList[i])
    }
    console.log(testList)
    URLList=testList
}