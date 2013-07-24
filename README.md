6.813 Example Collection
=======================

###Introduction

The 6.813 Example Collection module is a tool for visualizing and sifting through
large numbers of student-submitted examples. It includes a main viewing window that
shows each example in a small iframe and a collection creator that instructor can use 
to group together examples. 

###Embedding Instructions

You will need the following files from this repository:

	collection-grid.js
	collection-grid.css
	backend.js
	css
	js

Put them in the same directory as your HTML file.

#####HTML Tags

These go in the head of your HTML file, just copy and paste.

	<meta charset="utf-8"/>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js"></script> 
	<script src="js/bootstrap.min.js"></script> 
	<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
	<script type="text/javascript" src="backend.js"></script>
	<script type="text/javascript" src="collection-grid.js"></script> 
	<link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
	<link href="collection-grid.css" rel="stylesheet"></link>  

#####Including the Example Collection Module
In the body of your HTML file where you want the module to be, include the following HTML:
	
	<div class="row-fluid example-holder"></div>
    
###Google Spreadsheet Requirements
In your Google spreadsheet, there must be a column titled URL. This is where the viewer pulls the list of URLs from. Additionally, the Google spreadsheet must be published to the web. The viewer uses the JSON feed that Google publishes, which will not exist unless the document is published. It is recommended that your document is set to auto-publish, so that you can view updates dynamically.

######Using frontend.html to choose a Google Doc
If you navigate to collection-grid.html without URL variables, you will be redirected to frontend.html. This file asks for a Google docs URL, a list of the letters of the columns that want to display as commens on each website, and the column you wish to use for filtering. Once these are input and you hit submit, you will be redirected to a viewer with the info from your spreadsheet.