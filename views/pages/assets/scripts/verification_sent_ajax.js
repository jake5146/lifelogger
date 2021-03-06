$(document).ready(function() {
	sentVerification();

});

window.onbeforeunload = function (e) {
    return "You will lose the saved data if you leave. Do you really want to leave this page?";
};


var countdown;

function sentVerification() {
	$.ajax({
		type: "GET",
		url: "/verify-code",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
            $("#error-msg").hide();

            
    		var sess = res;
            if (!sess.infos) {
                alert("Please fill up a registration form first.");
                window.location.href = "/";
            }

    		console.log(sess);

            var timeout = 5 * 60 * 1000;

            countdown = setInterval(function() {
            	var min = Math.floor(timeout / (1000 * 60));
            	var sec = Math.floor((timeout % (1000 * 60)) / 1000);

            	if (sec < 10) {
            		sec = "0" + sec;
            	}

            	$("#time").text("0" + min + ":" + sec);
            	timeout = timeout - 1000;

            	if (timeout < 0) {
            		clearInterval(countdown);
            		requestSessionDestroy();
            	}
            }, 1000);

            //add handler for verifying code.
    		$("form#verif-code-form").submit(function(e) {
    			var verified = false;
    			var typedCode = $("input[name='verify-code']").val();
    			if (typedCode === sess.code) {
    				verified = true;
    			}
    			submitVerifCode(e, sess.infos, verified);
    		});
    	},
    	error: function(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

function submitVerifCode(e, infos, verified) {
	e.preventDefault();

	var $errorMsg = $("#error-msg");
	$errorMsg.hide();
	if (verified) {
		$.ajax({
			type: "POST",
			url: "/verif-code-submit",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify([infos]),
	    	success: function(res) {
	    		clearInterval(countdown);

	    		var response = res;

	    		if (response.msg) {
    				$errorMsg.show();
    				$errorMsg.text("Sorry, error occurs during the process. Please try again.");
	    		} else {
	    			//@@TODO: add "thank you for registration pop-up"
                    alert("Welcome! You have registered successfully!");
	    			window.location.href = "/";
	    		}
	    	},
	    	error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	} else {
		$("#error-msg").show();
		$("#error-msg").text("Invalid Code. Please try again.");
	}
}

//AJAX request for notifying server to delete session infos.
function requestSessionDestroy() {
	$.ajax({
		type: "GET",
		url: "/verif-code-destroy",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
			$("#error-msg").show();
    		if (res.msg) {
    			$("#error-msg").text("Sorry, error occurs during process. Please try again.");
    		} else {
    			$("#time").text("");
			    $("#time-txt").text("SESSION EXPIRED");
				$("#error-msg").text("Verification code timeout." + 
					" Please try registration again.");
				$("form#verif-code-form > input").prop("disabled", true);
    		}
    	},
    	error: function(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}