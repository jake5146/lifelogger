// javascript for account_info.html
$(document).ready(function() {
	showClickedMenu();

	profileEditAndCancelHandler();

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
	//disable profile editting initially.
    $("#profile-form > *").prop("disabled", true);

	var profilePrevData;

	$("button#profile-edit-btn").click(function() {
		$("button#profile-cancel-btn").prop("disabled", false);
		$("#profile-form > *").prop("disabled", false);

		profilePrevData = savePrevProfileData();

		$(this).hide();
		var $submitBtn = $("<input>", {
			type	: "submit",
			class	: "form-control",
			name	: "profile-submit",
			value	: "Submit"
		});
		$("div.profile-edit").prepend($submitBtn);

	});

	$("button#profile-cancel-btn").click(function() {
		$(this).prop("disabled", true);
		$("#profile-form > *").prop("disabled", true);

        setProfileData(profilePrevData);

		$("input[name='profile-submit']").hide();
		$("button#profile-edit-btn").show();
	});
}

// save Previous profile data into obj and return.
function savePrevProfileData() {
	var profilePrevData = {};

	$("#profile-form > input").each(function() {
    	profilePrevData[$(this).attr("name")] = $(this).val();
    });

    var $gender = $("#profile-form > select");
    profilePrevData[$gender.attr("name")] = $gender.val();

    profilePrevData.about = $("#about").val();

    //@TODO:  ADD PROFILE PICTURE DATA HERE

    return profilePrevData;
}

// Set new/old profile data to display profile info appropriately.
// @param1 data: profile data
function setProfileData(data) {
	$("#profile-form > input").each(function() {
    	$(this).val(data[$(this).attr("name")]);
    });

    var $gender = $("#profile-form > select");
    $gender.val(data[$gender.attr("name")]);

    $("#about").val(data.about);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Display Profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //