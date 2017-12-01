// javascript for registration.html
$(document).ready(function() {
    hideLoader();

	$("form#register-form").submit(function(e) {
        showLoader();
		submitRegisterForm(e);
	});
});

function submitRegisterForm(e) {
	e.preventDefault();

    //organize data in JSON.
    var registerJson = registerFormOrganizer();

    //console.log(registerJson);

    //If registerJSON equals to false, then this means invalid value has been typed
    // by user, so ask user to try again.
    if (!registerJson) {
    	//return here to prevent execution of ajax request.
    	return;
    }

    // ajax request for registration.
	$.ajax({
		type: "POST",
		url: "/submit-register-form",
    	contentType: "application/json",
    	dataType: "JSON",
    	data: JSON.stringify(registerJson),
    	success: function(res) {
    		$errorMsg = $("#error-msg");
    		$errorMsg.empty();
    		$errorMsg.hide();

    		var registerRes = res[0];

            // four cases:
            // 1. Query Error/nodemailer error    2. email already exists, 
            // 3. nickname already exists         4. Verification code sent
            var errTxt = "";
            //Database query fails. Asks user to try again.
            if (registerRes.msg) {
                errTxt = "Sorry, error occurs during the process. Please try again.";
                $errorMsg.show();
                hideLoader();
            // email already exists in the server. Ask user to try again.
            } else if (registerRes.emailExist) {
                errTxt = "Email aleady exists in the server. Please try again."
                $errorMsg.show();
                hideLoader();
            // nickname already exists in the server. Ask user to try again.
            } else if (registerRes.nickExist) {
                errTxt = "Nickname aleady exists in the server. Please try again."
                $errorMsg.show();
                hideLoader();
            } else { //registerRes.verifSent == 1
                // go to verification page
                console.log("--registerRes.verifSent==1--");
                window.location.href = "/verification";
            }
            $errorMsg.text(errTxt);
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

//Organize required area of form below. Handle cases of error.
// Case of error: return false
// Case of clear (no error found): organize required area and optional area in
//                                  JSON form and return it.
function registerFormOrganizer() {
    $errorMsg = $("#error-msg");
    $errorMsg.empty();
    $errorMsg.hide();

    var registerFormJson = [];
	var infos = {};

    //Organize required area of form below. Handle cases of error.
    var $email = $("input[name='email']");
    if ($email.val() !== $("input[name='re-email']").val()) {
    	$errorMsg.show();
    	var emailErrorMsg = "Email and Confirm Email must be same. Please try again.";
    	var $emailErrorDiv = $("<div>", {text: emailErrorMsg});
    	$errorMsg.append($emailErrorDiv);
    	
    	return false;
    } else {
    	infos.email = $email.val();
    }
      //add password area if password and confirm password match.
    var $password = $("input[name='password']");
    if ($password.val() !== $("input[name='re-password']").val()) {
    	$errorMsg.show();
    	var passErrorMsg = "Password and Confirm Password must be same. Please try again.";
    	var $passErrorDiv = $("<div>", {text: passErrorMsg});
    	$errorMsg.append($passErrorDiv);

    	return false;
    } else {
    	infos.password = $password.val();
    }
      
      //add firstname, lastname, birthday, gender area
    infos.first_name = $("input[name='firstname']").val();
    infos.last_name = $("input[name='lastname']").val();
    infos.birthday = $("input[name='birthday']").val();
    infos.gender = $("select[name='gender']").val();

      //add nickname area
    infos.nick_name = $("input[name='nickname']").val();

    //add optional area below
    var middle = $("input[name='middlename']").val();
    infos.middle_name = middle ? middle: null; 
    var phone = $("input[name='phone']").val();
    infos.phone_number = phone ? phone: null;

    registerFormJson.push(infos);
    
    return registerFormJson;
}

function showLoader() {
    $(".registration").css("opacity", 0.5);
    $(".loader").show();
}

function hideLoader() {
    $(".registration").css("opacity", 1);
    $(".loader").hide();
}