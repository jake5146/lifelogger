// javascript for account_info.html
$(document).ready(function() {
	showClickedMenu();

	profileEditAndCancelHandler();
	profileImgDisplayer();
	resetProfileImgHandler();

});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Menu Visualization ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (BELOW) //

// Only show contents of clicked menu.
function showClickedMenu() {
	var menus = ["li#profile-menu", "li#friends-menu", "li#category-menu", 
	             "li#manage-menu", "li#mod-pass-menu", "li#del-acc-menu"];

	var contents = ["div.profile", "div.friends", "div.categories",
	                "div.management", "div.modify-pass", "div.delete-account"];

    //Hide all menus
	hideMenus(contents, -1);

    //add click event listener to only show contents of clicked menu.
	$.each(menus, function(i, val) {
		$(val).click(function() {
			hideMenus(contents, i);
			$(contents[i]).toggle();
		});
	});
}

// hide all menus except a menu specified by iExcept.
// @param1 contents : css selectors of contents of menus.
// @param2 iExcept  : hide all menus except menu of this index in contents.
//         if iExcept is out of index, hide all menu.
function hideMenus(contents, iExcept) {
	$.each(contents, function(i, val) {
		if (iExcept != i) {
			$(val).hide();
		}
	});
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Menu Visualization ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Display Profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (BELOW) //

// Add event handler for edit and cancel.
function profileEditAndCancelHandler() {
    $("input[name='profile-submit']").hide();

	//disable profile editting initially.
    $("#profile-form > *").prop("disabled", true);

	var profilePrevData;
	var $profileBtn = $("#modify-profile-pic, #reset-profile-pic");

	$("button#profile-edit-btn").click(function() {
		$("button#profile-cancel-btn").prop("disabled", false);
		$("#profile-form > *:not(.unchangable)").prop("disabled", false);

        $profileBtn.css({"background-color": "white"});
        $profileBtn.hover(function() {
        	$(this).css({"cursor": "pointer", "background-color": "#d9d9d9"});
        }, function() {
        	$(this).css({"background-color": "white"});
        });

		profilePrevData = savePrevProfileData();

		$(this).hide();
		$("input[name='profile-submit']").show();
	});

	$("button#profile-cancel-btn").click(function() {
		$(this).prop("disabled", true);
		$("#profile-form > *:not(.unchangable)").prop("disabled", true);

		$profileBtn.css({"background-color": "#d9d9d9"});
		$profileBtn.hover(function() {
			$(this).css({"cursor": "no-drop"});
		}, function() {
			$(this).css({"background-color": "#d9d9d9"});
		});

        resetProfileData(profilePrevData);

		$("input[name='profile-submit']").hide();
		$("button#profile-edit-btn").show();
	});
}

// save Previous profile data into obj and return.
function savePrevProfileData() {
	var profilePrevData = {};

    var $birthday = $("#profile-form input[name='birthday']");
    var $phone = $("#profile-form input[name='phone']");
    var $gender = $("#profile-form > select");

    profilePrevData[$birthday.attr("name")] = $birthday.val();
    profilePrevData[$phone.attr("name")] = $phone.val();

    profilePrevData.about = $("#about").val();

    profilePrevData.profile = $("#profile-preview").attr("src");

    return profilePrevData;
}

// Set old profile data to display profile info appropriately.
// @param1 data: profile data
function resetProfileData(data) {
    var $birthday = $("#profile-form input[name='birthday']");
    var $phone = $("#profile-form input[name='phone']");
    var $gender = $("#profile-form > select");

    $birthday.val(data[$birthday.attr("name")]);
    $phone.val(data[$phone.attr("name")]);

    $("#profile-preview").attr("src", data.profile);
    resetProfileImgData();

    $("#about").val(data.about);
}

// Reset image to default image (for view)
function resetProfileImgHandler() {
	$("#reset-profile-pic").click(function() {
		$("#profile-preview").attr("src", "assets/images/default-profile.gif");
		resetProfileImgData();
	});
}

// reset input file (for profile image)
function resetProfileImgData() {
	var $profile = $("#profile-pic");
	$profile.wrap("<form>").closest("form").get(0).reset();
	$profile.unwrap();
}

// Display image on change.
function profileImgDisplayer() {
	var $profilePic = $("input[name='profile-pic']");
	var $profilePre = $("#profile-preview");

    previewImg($profilePic, $profilePre);

	$profilePic.change(function() {
		previewImg(this, $profilePre);
	});
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Display Profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~ (BELOW) //

// preview image on change in the specified block
// @param1 img: input file info
// @param2 block: block to display image
function previewImg(img, block) {
	if (img.files && img.files[0]) {
		console.log(img.files[0]);
		var reader = new FileReader();

		reader.onload = function(e) {
			block.attr("src", e.target.result);
		}

		reader.readAsDataURL(img.files[0]);
	}
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //