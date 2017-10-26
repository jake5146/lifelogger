// AJAX request handler for nav_settings
$(document).ready(function() {
	checkUserLogin();

});

function checkUserLogin() {
	$.ajax({
		type: "GET",
		url: "/check-user-login",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
    		var sess = res[0];

    		if (!sess.email) {
    			$(".if-no-user").hide();

    			var $li = $("<li>");
    			var $a = $("<a>", {text: "Login", href: "/"});

    			$li.prepend($a);
    			$(".navbar-right").prepend($li);


    		}
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}