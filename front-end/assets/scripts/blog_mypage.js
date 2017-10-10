// javaScript for blog_mypage.html
$(document).ready(function() {
	// Get rid of outline when mousedown on sort-icon and like-icon 
	$noOutlineButtons = $(".sort-icon, .like-icon, button.profile, button.edit");
	$noOutlineButtons.mousedown(function() {
		$(this).css({"outline": "0"});
	});

    // Category scroll event handler
    var $category = $(".category-nav");
    var categoryVertical = parseInt($category.css("top"), 10) - 50;;
	$(document).scroll(function() {
        var categoryCss;
		if ($(this).scrollTop() >= categoryVertical) {
			categoryCss = {"position": "fixed", "top": "70px"};
		} else {
			categoryCss = {"position": "absolute", "top": categoryVertical + 50};
		}
		$category.css(categoryCss);
	});

    // categories dropdown animation
	$(".category-header .glyphicon").click(function() {
		$(this).toggleClass("glyphicon-triangle-top");
		$(this).toggleClass("glyphicon-triangle-bottom");
		$(".category-nav .nav-pills").slideToggle("fast");
	});

	$(".open-addpost").click(function() {
		window.location.replace("add_post.html");
	});

	$(".glyphicon-heart").click(handleLikesIncrement);
});

// handle click handler for .like-number class. It increments number of likes.
function handleLikesIncrement() {
	var billion = 1000000000;
	var million = 1000000;
	//convert str to num appropriately
	var numLike = convertStrToNum($(".like-number").text());
	numLike += 1;
	var numLikeStr = "";
	// convert incremented number to appropriate string to display on screen
	if (numLike >= billion) {
		numLikeStr += (numLike / billion).toFixed(1) + 'B';
	} else if (numLike >= million) {
		numLikeStr += (numLike / million).toFixed(1) + 'M';
	} else if (numLike >= 1000) {
		numLikeStr += (numLike / 1000).toFixed(1) + 'K';
	} else {
		numLikeStr += numLike;
	}
	$(".like-number").text(numLikeStr);
}

// convert str (float+abbr like K, M, B..) to number
function convertStrToNum(str) {
	var convertedNum;
	//if str is not a number (which means it contains abbr)
	if (isNaN(str)) {
		var abbr = str[str.length-1];
		var numBeforeAbbr = str.substring(0, str.length-1);

		console.log(abbr);
		console.log(numBeforeAbbr);
		//for billion
		if (abbr === 'B') {
			convertedNum = parseFloat(numBeforeAbbr) * 1000000000;
	    // for million
		} else if (abbr === 'M') {
			convertedNum = parseFloat(numBeforeAbbr) * 1000000;
		// for thousand
		} else if (abbr === 'K') {
			convertedNum = parseFloat(numBeforeAbbr) * 1000;
		// for error case
		} else {
			console.log("Error: Wrong abbreviation for number of likes.");
		}
	// iff number is less than thousand
	} else {
		convertedNum = parseInt(str);
	}
    return convertedNum;
}
