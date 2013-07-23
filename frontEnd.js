

//buildInputs creates inputs that take form the user a google doc URL, and a list of numbers that are used to determine what user inputs will be displayed.
var buildInputs = function(){
    var keyInput = $('<div>Published Google Doc URL <input type="text" class="key"></input></div>')
    var categoryColInput = $('<div>Filter Column<input type="text" class="category"></input>Input the letter of the column that you wish to filter by.</div>')
    var displayedColInput = $('<div>Comment Columns<input type="text" class="displayed"></input>Which columns do you want to be viewable as comments? Input letters, split by commas with no spaces</div>')
    var submitButton = $('<button class="btn submit" onClick="getInputContents()">View Sites!</button>')
    
    $('.inputsDiv').append(keyInput)
        .append(categoryColInput)
        .append(displayedColInput)
        .append(submitButton)
}

// getInputContents pulls the contents of the inputs, and uses them to create a html query of the variables that the main page uses.
var getInputContents = function(){
    var googleURL = $('.key').val()
    var URLParts = googleURL.split("key=")[1]
    var googleKey= URLParts.split("#")[0]
    console.log (URLParts)
    
    var category = $('.category').val()
    var displayed = $('.displayed').val()

    var URLQuery = '?googleKey='+googleKey+'&sheet=od6&category='+category+'&displayed='+displayed+'&end=true'
    console.log(URLQuery)
    window.location = 'collection-grid-single.html'+URLQuery
}


$('document').ready(function(){
buildInputs()
})