var urlList = ["http://writinglounge.proboards.com/index.cgi", "http://www.dokimos.org/ajff/", "http://www.mspaintadventures.com/sweetbroandhellajeff/comoc.php", "http://mizzpheonixrightxxxx.piczo.com/", "http://edtech2.boisestate.edu/chasea/websitebeginner/color1ex1.html", "http://www.spaceistheplace.ca/", "http://www.fivedoves.com/", "http://www.crazywebsite.com/Pg-Crazy-Websites-Free…Funny-Weird-Interesting-Internet-Web-Sites-1.html", "http://sa.onenation.com.au/", "http://www.angelfire.com/super/badwebs/main.htm", "http://smithandgoldsmith.homestead.com/home.html", "http://www.miauk.com", "http://www.angelfire.com/ny4/BungalowBill/", "https://www.heroku.com/", "http://www.angelfire.com/super/badwebs/", "http://www.scs.stanford.edu/", "stellar.mit.edu", "http://www.pennyjuice.com/htmlversion/whoispj.htm", "http://www.metafilter.com/", "http://wonder-tonic.com/geocitiesizer/content.php?theme=1&music=1&url=http://savedelete.com", "http://www.laundryview.com/laundry_room.php?lr=136487", "http://www.pnwx.com/", "http://www.pagoda.com/", "http://now.sprint.com/nownetwork/", "http://www.valleyisleaquatics.com/", "http://www.nick-asia.com/", "http://larrycarlson.com/medijate/index2.htm", "http://www.dpgraph.com/", "http://www.constellation7.org/Constellation-Seven/Josiah/Index.htm", "http://www.economist.com/", "http://www.goprincetontigers.com/", "http://www.spectrumpowderworks.com/", "http://www.timecube.com/", "http://www.csun.edu/~hcedu013/eslplans.html", "http://www.fabricland.co.uk/", "thebadwebsite.com", "http://www.arngren.net/", "http://www.savewalterwhite.com/", "http://www.bw-hilchenbach.de/body_ex__klose_.html", "http://www.rainbowlanesclayton.com/", "rogerart.com", "www.cambridgesidegalleria.com", "http://andoverma.gov/", "http://wonder-tonic.com/geocitiesizer/index.php", "http://gitelink.com/bandb-in-france/", "http://art.yale.edu/", "http://www.tgigreek.com/spiritjersey.aspx", "http://www.gov.il/firstgov/english", "http://reclipse.net/v2.html", "http://campusstore.ric.edu/home.aspx", "http://www.omfgdogs.com/", "bikesdirect.com", "tfrrs.org", "http://www.reddit.com/r/Diablo", "georgehutchins.com", "http://www.bw-hilchenbach.de/body_kriegsmarine.html"]
var iframeMaker = (function() {

	exports = {}

	var setup = function(div) {
		for (var i = 0; i < urlList.length; i++) {
			var li = $('<li class = "iframe ui-state-default">')
			var overlay = $('<div class="overlay"></div>')
			var iframe = $('<iframe sandbox="" width="1000" height="750" src='+urlList[i]+' style="-webkit-transform:scale(0.24);-moz-transform-scale(0.25);">')
			// var buttons = $('<div class="buttons"><button class="one">1</button><button class="two">2</button><button class="three">3</button></div>')
			// overlay.append(buttons)
			li.append(overlay, iframe)
			div.append(li)
		}
	}
	exports.setup = setup
	return exports
})();

$(document).ready(function() {
	$("#sortable").each(function() {
		iframeMaker.setup($(this));
	});
});