// javascript for add_post.html
$(document).ready(function() {
	//close add post when remove-icon or cancel is clicked
	$(".close-addpost").click(function() {
		window.location.replace("blog_mypage.html");
	});
    
    //add font family
	addFontFamilyOptions();
    //add change event handler for the change of font family
	$(".change-font").change(changeFontFamily);

	//add font size
	addFontSizeOptions();
	//add change event handler for the change of font size.
	$(".change-fontsize").change(changeFontSize);
});

// add font family options to 'add post' section.
function addFontFamilyOptions() {
	var fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Times", "Courier New",
	                     "Courier", "Verdana", "Georgia", "Palatino", "Garamond",
	                     "Bookman", "Comic Sans MS", "Trebuchet MS", "Arial Black", 
	                     "Impact"];
    fontFamilies.forEach(function(family) {
    	var $option = $("<option>", {value: family, text: family});
    	$(".change-font").append($option);
    });
}

// change font family on change of select.change-font
function changeFontFamily() {
	var fontFamily = $(".change-font").val();
	$(".display-area").css({"font-family": fontFamily + ", sans-serif"});
}

// add font size options to 'add post' section
function addFontSizeOptions() {
    var fontSizes = [7, 8, 9, 10, 11, 12, 14, 18, 24, 36];
    fontSizes.forEach(function(size) {
    	var $option = $("<option>", {value: size + "px", text: size + "px"});
    	$(".change-fontsize").append($option);
    });
    //set 14px as an default option
    $(".change-fontsize option[value='14px']").attr("selected", "selected");
}

// change font family on change of select.change-fontsize.
function changeFontSize() {
	var fontSize = $(".change-fontsize").val();
	$(".display-area").css({"font-size": fontSize});
}