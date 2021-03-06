// ajax request handler for main.html
$(document).ready(function() {
	$("form#email-login-form").submit(function(e) {
		submitLoginForm(e);
	});

	$("#register").click(function(e) {
		e.preventDefault();

		$.ajax({
			type: "GET",
			url: "/registration",
			success: function(res) {
				window.location.href = "/register";
			},
			error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	});

});

//Login form handler for ajax POST
function submitLoginForm(e) {
	e.preventDefault();

    var loginFormJson = arrayToJson($("form#email-login-form").serializeArray());

    $.ajax({
    	type: "POST",
    	url: "/email-login",
    	contentType: "application/json",
    	dataType: "JSON",
    	data: JSON.stringify(loginFormJson),
    	success: function(res) {
    		//hide error message initially.
    		var $errorMsg = $("#error-msg");
		    $errorMsg.hide();
            
    		//assign to object of res.
    		var loginRes = res;
    		console.log(loginRes);
            var errTxt = "";
    		//Login info is invalid (login fails). Asks user to try again.
    		if (loginRes.loginCode === 0) {
    			errTxt = "Invalid email or password. Please try again.";
    			$errorMsg.show();
    		//Login succeeds. Redirect to the my blog page.
    		// (loginRes.loginCode === 1)
    		} else if (loginRes.loginCode === 1) {
                // pageRendering();
                var fname = loginRes.first_name.toLowerCase().replace(/\s+/, "");
                var uniqueUrl = "/blog/" + fname + "-" + loginRes.uid;
    			window.location.replace(uniqueUrl);
    		} else { //Database query fails. Asks user to try again.
    			errTxt = "Sorry. Error occurs on the database. Please try again.";
    			$errorMsg.show();
    		}
    		// add error message according to responded code.
    		$errorMsg.text(errTxt);
    	},
    	error: function(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
    });

}

function pageRendering() {
    $.ajax({
        type: "GET",
        url: "/page-render",
        contentType: "application/json",
        dataType: "JSON",
        success: function(res) {
            if (res.sessErr) {
                alert(res.sessErr + " Redirecting to the main page.");
                window.location.href = "/";
            } else {
                var info = res[0];
                var url = "/blog/" + info.first_name.toLowerCase() + "-" + info.uid;
                window.location.replace(url);
            }
        },
        error: function(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function arrayToJson(arr) {
	var json = [];
	var jsonObj = {};
	$.each(arr, function(i, obj) {
		jsonObj[obj.name] = obj.value;
	});
	json.push(jsonObj);
	return json;
}