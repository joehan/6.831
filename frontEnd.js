var buildInputs = function(){
    var keyInput = $('<div>Google Key <input type="text" class="key"></input></div>')
    var sheetInput = $('<div>Worksheet ID<input type="text" class="sheet"></input></div>')
    var categoryColInput = $('<div>Category Column<input type="text" class="category"></input>Numbers seprated by commas, please</div>')
    var displayedColInput = $('<div>Comment Columns<input type="text" class="displayed"></input>Numbers seprated by commas, please</div>')
    var submitButton = $('<button class="submit" onClick="getInputContents()">Submit</button>')
    
    $('.inputsDiv').append(keyInput)
        .append(sheetInput)
        .append(categoryColInput)
        .append(displayedColInput)
        .append(submitButton)
}

var getInputContents = function(){
    $('.inputsDiv').append($('<div>Recorded</div>'))
    var googleKey = $('.key').val()
    var sheet = $('.sheet').val()
    var category = $('.category').val()
    var displayed = $('.displayed').val()
    console.log( [googleKey, sheet, category, displayed])
    var URLQuery = '?googleKey='+googleKey+'&sheet='+sheet+'&category='+category+'&displayed='+displayed
    console.log(URLQuery)
    $('.inputsDiv').append($('<div>Now, just append the following text to the end of the URL of the viewer:</div><div>'+URLQuery+'</div>'))
}


$('document').ready(function(){
buildInputs()
})