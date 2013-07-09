//var sample_url = "https://docs.google.com/spreadsheet/pub?key=0AgtGE4FgUNk1dERRcF9RTU91OU5KQzVjTzdiQjJkOEE&output=html";
//var url = sample_url;
//
//var getData = function(){    
//    localStorage.clear();
//    var googleSpreadsheet = new GoogleSpreadsheet();
//    googleSpreadsheet.url(url);
//    var infoArray = googleSpreadsheet.load(function(result) {
//        console.log(result)
////        var sortedArray = sortData(result.data)
////        console.log(sortedArray)
//        $('#results').html(JSON.stringify(result).replace(/,/g,",\n"));
//    }());
//     $('#code').html($('#script').html())
//      $('#spreadsheet_url').html("<a href='"+url+"'>"+url+"</a>");
//      $('#iframe').attr("src",url);
//      $('input[name]').val(url);
//      if (url != sample_url){
//        $("div#links").append("<br/><a href='"+document.location.pathname+"'>Original Sample Spreadsheet</a>")
//      }
//    return infoArray;
//}
//
//getData();




var sortData = function(array){
    
    var sortedArray =[];
    var arrayLength= array.length;
    
    var columns = 10. //The number of columns in the google doc being used- blank cells are not supported yet.
    
    var columnNames = ['Timestamp', 'Name', 'Athena', 'IP', 'URL', 'Background', 'Foreground', 'Evaluation', 'VisCheck', 'Comments'] //An array containing the names of each column.
    
    for (var i=0; i<arrayLength;i+=10){
        var rowArray = {}
        for (var j=0; i<columns;j++){
            if (i!=0){//Ignores first row of data to avoid parsing titles
                rowArray[columnNames[j]] = array[i+j]
                }
        }
            sortedArray.append(rowArray)
    }
    console.log(sortedArray)
    return(sortedArray)
}
