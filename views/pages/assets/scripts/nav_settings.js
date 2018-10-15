// module for navbar settings
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    navSettings();
    liveChatSettings();
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
        toggleNavWindows("#user-caret", ".nav-window.dropdown-menu");
    });

    //toggle messanger/notification blocks (go to nav_settings_ajax.js)
}

function toggleNavWindows(btnClass, windowClass) {
    if (!$(btnClass).hasClass("shown")) {
        $(".nav-window.shown").hide();
        $("#external-navbar .shown").removeClass("shown");
    }
    $(btnClass).toggleClass("shown");
    $(windowClass).toggleClass("shown");
    $(windowClass).toggle();
}

function liveChatSettings() {
    $(document).click(function(e) {
        if ($(e.target).closest("#live-chat-top").length !== 0) {
            var $top = $("#live-chat-top");
            if ($top.hasClass("chat-full")) {
                $top.removeClass("chat-full");
                $top.addClass("chat-minimized");
                //$top.css({bottom: "0px"});
                liveChatTopHover("#e6e6e6", "#f2f2f2");
                $("#live-chat-contents, #live-chat-bottom").hide();
            } else {
                $top.removeClass("chat-minimized");
                $top.addClass("chat-full");
                //$top.css({bottom: "304px"});
                //liveChatTopHover("#8a8a5c", "#999966");
                $("#live-chat-contents, #live-chat-bottom").show();
                //selectTextArea();
            }
        } else if ($(e.target).closest("#live-chat-contents").length === 0 &&
                   $(e.target).closest("#live-chat-bottom").length === 0) {
            $("#live-chat-bottom, .chat").css({height: "32px"});
            $("#live-chat-contents").css({height: "272px"});
            liveChatTopHover("#e6e6e6", "#f2f2f2");
        }  else {
            $("#live-chat-bottom, .chat").css({height: "96px"});
            $("#live-chat-contents").css({height: "208px"});
            liveChatTopHover("#8a8a5c", "#999966");
            selectTextArea();
            $("#live-chat-contents").scrollTop($("#live-chat-contents")[0].scrollHeight);
            var chatid = parseInt($("#chatbox-msg-form").attr("class").replace("room-", ""));
            console.log("read it 2");
            updateChatUnreadBadge(chatid);
        }

        if ($(e.target).closest(".nav-window").length === 0 &&
            $(e.target).closest(".nav-window-btn").length === 0) {
            $(".nav-window.shown").hide();
            $("#external-navbar .shown").removeClass("shown");
        }
    });
}


function liveChatTopHover(colorin, colorout) {
    $("#live-chat-top").css({"background-color": colorout});
    $("#live-chat-top").hover(function() {
        $(this).css({"background-color": colorin});
    }, function() {
        $(this).css({"background-color": colorout});
    })
}

function selectTextArea() {
    var length = $("textarea.chat").val().length;
    $("textarea.chat")[0].setSelectionRange(length, length);
    $("textarea.chat").focus();
}