// javascript for account_info.html
$(document).ready(function() {
	showClickedMenu();

	profileEditAndCancelHandler();
	imgDisplayer($("#profile-pic"), $("#profile-preview"));
	resetImgHandler($("#profile-pic"), $("#reset-profile-pic"), 
					$("#profile-preview"), "default-profile.gif");

	managementInit();
	managementEditAndCancelHandler();
	imgDisplayer($("#upload-header-bg"), $("#header-bg-preview"));
	resetImgHandler($("#upload-header-bg"), $("#reset-header-bg"), 
					$("#header-bg-preview"), "bg-header-default.jpg");

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
    resetImgData($("#profile-pic"));

    $("#about").val(data.about);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Display Profile ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //

/* ********** Management Settings ********** (BELOW) */
function managementInit() {
	$("#header-color-picker").spectrum({
		color: "black",
		cancelText: "reset"
	});

	disableManagementOptions();
}

function managementEditAndCancelHandler() {

	var prevManageData = {};

	$("#manage-edit-btn").click(function(e) {
		e.preventDefault();
		$("input[name='manage-submit']").show();
		$(this).hide();
		$("#header-color-picker").spectrum("enable");
		$("#manage-form input").attr("disabled", false);
		// $("#upload-header-bg").attr("disabled", false);
		// $(".notify-label input").attr("disabled", false);
		// $(".footer-sent input").attr("disabled", false);
		$("#manage-cancel-btn").attr("disabled", false);
		$("#reset-header-bg").attr("disabled", false);

		prevManageData = saveManageData(); 
	});

	$("#manage-cancel-btn").click(function(e) {
		disableManagementOptions(e);
		resetManageData(prevManageData);
	});
}

function disableManagementOptions(e) {
	if (e) e.preventDefault();
	$("#manage-edit-btn").show();
	$("input[name='manage-submit']").hide();
	$("#header-color-picker").spectrum("disable");
	// $("#upload-header-bg").attr("disabled", true);
	// $(".notify-label input").attr("disabled", true);
	// $(".footer-sent input").attr("disabled", true);
	$("#manage-cancel-btn").attr("disabled", true);
	$("#reset-header-bg").attr("disabled", true);
	$("#manage-form input").attr("disabled", true);
}


//save management's data and return those
// list: color-picker, header image, label input (radios), footer sentence
function saveManageData() {
	var data = {};
	data.header_color = $("#header-color-picker").spectrum("get");
	data.header_image = $("#header-bg-preview").attr("src");
	data.notify1 = $("input[name='notify1']:checked").val();
	data.notify2 = $("input[name='notify2']:checked").val();
	data.footer = $(".footer-sent input").val();
	data.blog_title = $(".blog-title input").val();
	console.log(data);

	return data;
}

function resetManageData(data) {
	$("#header-color-picker").spectrum("set", data.header_color);
	$("#header-bg-preview").attr("src", data.header_image);
	$("input[name='notify1'][value='" + data.notify1 + "']").prop("checked", true);
	$("input[name='notify2'][value='" + data.notify2 + "']").prop("checked", true);
	$(".footer-sent input").val(data.footer);
	$(".blog-title input").val(data.blog_title);
	resetImgData($("#upload-header-bg"));
}

/* ********** Management Settings ********** (ABOVE) */


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~ (BELOW) //

// Display image on change.
function imgDisplayer($input, $preview) {
    previewImg($input, $preview);

	$input.change(function() {
		previewImg(this, $preview);
	});
}


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

// Reset image to default image (for view)
function resetImgHandler($img, $reset, $preview, defaultImg) {
	$reset.click(function(e) {
		e.preventDefault();
		$preview.attr("src", "assets/images/" + defaultImg);
		resetImgData($img);
	});
}

// reset input file (for input file image)
function resetImgData($img) {
	$img.wrap("<form>").closest("form").get(0).reset();
	$img.unwrap();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~ (ABOVE) //