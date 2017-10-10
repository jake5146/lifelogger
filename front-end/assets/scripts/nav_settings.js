// module for navbar settings
$(document).ready(function() {
    navSettings();
});

/* Setup navigation interaction features. (export it) */
function navSettings() {
	// menu-popper is for showing navigation that has been hidden. Hide this initally.
	$(".menu-popper").hide();

    // disable bootstrap's default click event which changes background-color of button.
	$("#menu-up").click(function() {
        // override bootstrap's change of background-color with navbar's color.
		$(this).css({"background-color":"#222"});
	});

    // indicator to check if navbar is opened (event for when navbar is collapsed)
    var isNavbarOpened = false;
    var $navbarMenu= $("#navbar-toggle");
    // change background-color of menu button according to indicator.
	$navbarMenu.click(function() {
		var menuBgColor = $(this).css("background-color");
        if (isNavbarOpened) {
        	$(this).css({"background-color":"rgb(34, 34, 34)"});
        } else {
            $(this).css({"background-color":"rgb(51, 51, 51)"});
        }
        isNavbarOpened = !isNavbarOpened;
	});
    
    // change background-color of menu button according to indicator
	$navbarMenu.hover(function() {
    	$(this).css({"background-color":"rgb(51, 51, 51)"});
    }, function() {
    	if (!isNavbarOpened) {
    	    $(this).css({"background-color":"rgb(34, 34, 34)"});
    	}
    });

    //change dropdown caret to caret-up, or vice-versa, when clicked
    $(".dropdown").on("hide.bs.dropdown", function(){
        $("#user-caret").html('<span class="glyphicon glyphicon-user">' 
            + '</span><span class="caret"></span>');
    });
    $(".dropdown").on("show.bs.dropdown", function(){
        $("#user-caret").html('<span class="glyphicon glyphicon-user">' 
            + '</span><span class="caret caret-up"></span>');
    });

    // toggle navbar when clicking menu-up/down button.
    $(".menu-toggle").click(function() {
    	$(".menu-controller").toggle();
    });

    //animate sliding when dropdown menu is clicked
    $("#user-caret").click(function() {
        $(".dropdown-menu").slideToggle("fast");
    });
}