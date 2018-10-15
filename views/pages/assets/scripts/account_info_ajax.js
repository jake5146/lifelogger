var friendOffset = 0;

$(document).ready(function() {
	hideMessages();
	getPersonalInfo();
	submitProfileInfo();

	getFriendsInfo("", friendOffset);
	$("input.search-friends").keyup(function() {
		friendOffset = 0;
		var keyword = $(this).val();
		$(".display-friends").empty();
		getFriendsInfo(keyword, friendOffset);
	});
	$(".friend-expand-btn button").click(function() {
		getFriendsInfo($("input.search-friends").val(), friendOffset);
	});
	//@@TODO: consider offset and keyword when expanding

	getCategoryInfo();
	submitEdittedCategory();

	submitManagementInfo();

	submitModifyPassword();

	submitDeleteAccount();
});

/* ********** Hide Messages (BELOW) ********** */

function hideMessages() {
	var msgs = [".msg-profile", ".msg-category", ".msg-manage", ".msg-pass", ".msg-delete"];
	$.each(msgs, function(i, val) {
		$(val).hide();
	});
}

/* ********** Hide Messages (ABOVE) ********** */


/* ********** Profile AJAX (BELOW) ********** */

// GET Profile information from database 
function getPersonalInfo() {
	$.ajax({
		type: "GET",
		url: "/acc-personal",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
            var info = res;

            console.log(info);

            var $error = $(".error-msg");
            $error.hide();

            if (info.msg || info.invalid) {
            	$error.show();
            	$error.text("Sorry. Error occurred during loading information." +
            		" Please try again.");
            } else {
            	// profile section
            	$("#profile-form input[name='name']").val(getFullName(info.first_name, 
	            													  info.middle_name, 
	            													  info.last_name));
            	$("#profile-form input[name='nickname']").val(info.nick_name);
            	$("#profile-form input[name='email']").val(info.email);
            	$("#profile-form select[name='gender']").val(info.gender);
            	$("#profile-form input[name='birthday']").val(getDate(info.birthday));
            	$("#profile-form input[name='phone']").val(info.phone_number);
            	$("#profile-form textarea#about").val(info.about);
                
                if (info.profile) {
                	$("#profile-preview").attr("src", "./uploads/" + info.profile);
                }

                // management section
                if (info.blog_title) {
                	$(".blog-title input").val(info.blog_title);
                } else {
                	$(".blog-title input").val(info.first_name + "'s Blog");
                }

                if (info.header_color) {
                	$("#header-color-picker").spectrum("set", info.header_color);
                }
                if (info.header_bg) {
                	$("#header-bg-preview").attr("src", "./uploads/" + info.header_bg);
                }
                if (info.footer_sent) {
                	$(".footer-sent input").val(info.footer_sent);
                } else {
                	$(".footer-sent input").val("A gentle answer turns away wrath, " + 
                								"but a harsh word stirs up anger " + 
                								"(Proverbs 15:4)");
                }

                var notifyComment = (info.notify_comment) ? "notify1-enable": "notify1-disable";
                var notifyLikes = (info.notify_likes) ? "notify2-enable": "notify2-disable";
                $("input[name='notify1'][value='" + notifyComment + "']").prop("checked", true);
                $("input[name='notify2'][value='" + notifyLikes + "']").prop("checked", true);
            }
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

// Submit editted profile infos.
function submitProfileInfo() {
	$("form#profile-form").submit(function(e) {
		e.preventDefault();

		//Get data using FormData class.
		var formData = new FormData($("#profile-form")[0]);

		var phone = $("#profile-form input[name='phone']").val();
		var about = $("#profile-form textarea#about").val();

		formData.set("phone", phone ? phone: "");
		formData.set("about", about ? about: "");


		//set contentType to false in order to prevent the boundary string from being
		// missed from it.
		//set processData to false in order to prevent Jquery from automatically
		// transforming the data into a query string.
		$.ajax({
			type: "POST",
			url: "/submit-profile-edit",
			data: formData,
	    	contentType: false,
	    	processData: false,
	    	success: function(res) {
	    		console.log(res);

                var $msg = $(".msg-profile");
            	$msg.show();

	    		if (res.msg) {
	    			$msg.css({"background-color": "rgba(204, 0, 0, 0.6)"});
            		$msg.text("Sorry. Error occurred during submission." +
            					" Please try again.");
	    		} else {
	    			$msg.css({"background-color": "rgba(0, 230, 0, 0.6)"});
	    			$msg.text("Successful!");
	    			setTimeout(function() { $msg.hide(); }, 5000);
	    			
	    			$("button#profile-cancel-btn").prop("disabled", true);
					$("#profile-form > *:not(.unchangable)").prop("disabled", true);

					var $profileBtn = $("#modify-profile-pic, #reset-profile-pic");
					$profileBtn.css({"background-color": "#d9d9d9"});
					$profileBtn.hover(function() {
						$(this).css({"cursor": "no-drop"});
					}, function() {
						$(this).css({"background-color": "#d9d9d9"});
					});

					$("input[name='profile-submit']").hide();
					$("button#profile-edit-btn").show();
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	});
}


/* ********** Profile AJAX (ABOVE) ********** */

/* ********** Categories (PART1: EDIT) AJAX (BELOW) ********** */

// GET Category information from database 
var category;
var pCount;
var cCount;
function getCategoryInfo() {
	$.ajax({
		type: "POST",
		url: "/acc-categories",
    	contentType: "application/json",
    	dataType: "JSON",
    	data: JSON.stringify({uid: undefined}),
    	success: function(res) {
            console.log(res);
            //organizeCategories: refer to helper_functions.js
            category = organizeCategories(res);
            console.log(category);
            displayExistingCategories(category);

            pCount = $("li.parent-tree").length;
            cCount = $("li.child-tree").length;

            var catJson = {};
			catJson.pcid = {};
			catJson.ccid = {};
			$("#category-form input").val(JSON.stringify(catJson));

            $("li.parent-tree, li.child-tree, li.tree-root").click(selectClickedCat);
            $("#add-category-btn").click(addCategory);
            $("#delete-category-btn").click(notifyBeforeRemovingCategory);
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

/* Display category infos that are extracted from database properly. */
function displayExistingCategories(category) {
	var parents = category[0];
    var pToC = category[1];
    
    var $display = $("#display-block");

    var $list = $("<ul>", {
    	id: "tree"
    });
    var $allLi = createCategoryElement("all-category tree-root tree-selected", "All");
    $list.append($allLi);

    var pcids = Object.keys(parents).map(x => parseInt(x));
    pcids = pcids.sort(sortFcn); 
    $.each(pcids, function(i, val) {
    	var pClassName = "parent-tree tree-node tree-id-" + val;
    	var $pLi = createCategoryElement(pClassName, parents[val]);

    	var children = pToC[val];
    	if (children) {
    		var $childList = $("<ul>");
    		var ccids = Object.keys(children).map(x => parseInt(x));
    		ccids = ccids.sort(sortFcn);
    		$.each(ccids, function(j, cval) {
    			var cClassName = "child-tree tree-node tree-id-" + cval;
    			var $cLi = createCategoryElement(cClassName, children[cval]);
    			$childList.append($cLi);
    		});

    		$pLi.append($childList);
    	}

    	$list.append($pLi);
    });

    $display.append($list);
}

/* Using <ul> and <li>, create category's element using given className and
 * the name of category. */
function createCategoryElement(className, cname) {
	var $li = $("<li>", {
		class: className
	});
	var $div = $("<div>", {
		class: "list"
	});
	var $label = $("<label>");
	var $span = $("<span>", { text: cname });

	$label.append($span);
	// $div.append($icon);
	$div.append($label);
	$li.append($div);

	return $li;
}

/* Allow user to select clicked category and highlight it to indicate that it is
 * selected. On second click, allow user to edit category names and 
 */
function selectClickedCat(e) {
	e.stopPropagation();

	//@@
	console.log($(this));
	//@@

	$("li.tree-edittable").removeClass("tree-edittable");
	if (!$(this).hasClass("tree-selected")) {
		$("li.tree-selected").removeClass("tree-selected");
		$(this).addClass("tree-selected");
	}

	$("li.tree-selected:not(.tree-root) > div.list span").click(function(e) {
		e.stopPropagation();
		var $li = $(this).parent().parent().parent();
		if (!$(this).hasClass("tree-selected")) {
			$("li.tree-selected").removeClass("tree-selected");
			$li.addClass("tree-selected");
		}

		if ($li.hasClass("tree-selected")) {
			$("li.tree-edittable").removeClass("tree-edittable");
			$li.addClass("tree-edittable");
		}

		// console.log("tree-selected added");
		if (($(this).children("input").length === 0) && $li.hasClass("tree-edittable")) {
			var catName = $(this).text();
			$(this).text("");
			var $input = $("<input>", {
				type: "text",
				name: "edittable-input",
				value: catName,
				class: "edit-cat",
				maxlength: "32"
			});
			$(this).append($input);

			var $span = $(this);
			var $editInput = $span.children("input");
			//display editted name of category on user interface (not on database yet)
			// on enter key.
			$editInput.keypress(function(e) {
		    	if (e.which == 13 || e.keyCode == 13) {
		    		applyEditCategoryName($li, $span);
		    	}
		    });

			//display editted name of category when focusing out input.
		    $editInput.focusout(function() {
		    	applyEditCategoryName($li, $span);
		    });
		}
	});
}

/* Display editted name of category on user interface.
 * It doesn't unselect category, but disable editting by input until
 * user clicks to edit again. */
function applyEditCategoryName($li, $span) {
	var $input = $span.children("input");
	$span.text($input.val());
	if ($li.hasClass("temp-tree")) {
		saveChangeInCategory($span, $input.val(), "add-category");
	} else {
		saveChangeInCategory($span, $input.val(), "modify-category");
	}
	//saveChangeInCategory($span, $input.val());
	$input.remove();
}

/* Save changed info to input[name=inputName] in JSON format 
 * to POST it to server later. */
function saveChangeInCategory($span, catName, inputName) {
	var $editInput = $("input[name='" + inputName + "']");
	var addCatJson = addCatJson = JSON.parse($editInput.val());
	console.log(addCatJson);
	// if (addCatJson.length === 0) {
	// 	addCatJson = {};
	// 	addCatJson.pcid = {};
	// 	addCatJson.ccid = {};
	// } else {
	// 	addCatJson = JSON.parse(addCatJson);
	// }

    $(".msg-category").hide();
	var display = document.getElementById("display-block");
	console.log($span);
	var $li = $span.closest(".tree-node", display);
	console.log($li);
	if ($li.length > 0) {
		var classes = $li.attr("class").split(/\s+/);
		var cid = classes.filter(function(val) {
			return val.indexOf("tree-id-") != -1;
		});
		cid = cid[0].replace("tree-id-", "");

		if (classes.indexOf("parent-tree") === -1) {
			console.log("$li:");
			console.log($li);
			console.log("$li.closest('parent-tree'...):");
			console.log($li.closest(".parent-tree", display));
			var pClasses = $li.closest(".parent-tree", display).attr("class").split(/\s+/);
			var pcid = pClasses.filter(function(val) {
				return val.indexOf("tree-id-") != -1;
			});
			pcid = pcid[0].replace("tree-id-", "");
			addCatJson.ccid[cid] = [catName, pcid];
		} else {
			addCatJson.pcid[cid] = [catName];
		}
		console.log(addCatJson);
        
        $editInput.val(JSON.stringify(addCatJson));
        console.log($editInput.val());
	} else {
		$(".msg-category").show();
		$(".msg-category").text("Error occurs during processing requested task.");
	}
}

/* POST editted categories to the server. */
function submitEdittedCategory() {
	$("#apply-cat-edit").click(function(e) {
		e.preventDefault();
		showLoader("body");
		var catData = [JSON.parse($("input[name='add-category']").val()),
		               JSON.parse($("input[name='delete-category']").val()),
		               JSON.parse($("input[name='modify-category']").val())];
		console.log(catData);
		$.ajax({
			type: "POST",
			url: "/submit-category-edit",
			contentType: "application/json",
			dataType: "JSON",
			data: JSON.stringify(catData),
	    	success: function(res) {
	    		hideLoader("body");
	    		console.log(res);
	    		var $msg = $(".error-msg");
	    		$msg.hide();

	    		if (res.msg) { //in case of query error.
	    			$msg.show();
	    			$msg.text("Sorry. Error occurred during loading information." +
	            		" Please try again.");
	    		} 
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	});
}

/* ********** Categories (PART1: EDIT) AJAX (ABOVE) ********** */

/* ********** Categories AJAX (PART2: ADD) (BELOW) ********** */

/* Add cateogory on 'Add Category' button. Function's behavior differs depending
 * on which category is selected.
 * Case 1: 'All' is selected -> add parent category to the end
 * Case 2: class 'parent-tree' is selected -> add child category to the end of 
 *                                            inner tree of selected parent. 
 * Case 3: class 'child-tree' is selected -> Notify user that tree can be nested
 *                                           only once. */
 function addCategory() {
 	var $selected = $(".tree-selected");
 	$(".delete-cat").hide();
 	if ($selected.hasClass("tree-root")) {
 		pCount++;
 		var className = "parent-tree tree-node temp-tree tree-id-" + pCount;
    	var $li = createCategoryElement(className, "New Parent Category");
 		$("ul#tree").append($li);
 		$li.click(selectClickedCat);
 		$li.trigger("click");
 		$li.find("span").trigger("click");
 		// add one parent category at the end
 		// class: parent-tree tree-node tree-id- & temp-tree
 		// retrieve largest parent-tree-id from category global variable
 		// TODO: or keep track of largest tree id (both parent and child) to
 		//        make this process easier
 		// then create by "createCategoryElement" function (given name will be)
 		// "New Category"
 		// then using jquery's trigger function: $(~~).trigger('click') to
 		// enable editting immediately
 		// TODO:: edit "edit category function" to make it distinguish 
 		//         between tree nodes and temporary tree nodes.
 		//        Temporary tree nodes' info only plays in add-category input
 		//        Regular tree nodes play in modify-category input.
 		// don't forget to add info of temp-tree in add-category input
 	} else if ($selected.hasClass("parent-tree")) {
 		var $children = $selected.children("ul");
 		console.log("children length:" + $children.length);
 		if (!$children.length) {
 			var $ul = $("<ul>");
 			$selected.append($ul);
 			$children = $selected.children("ul");
 		}
 		cCount++;
 		var className = "child-tree tree-node temp-tree tree-id-" + cCount;
 		var $li = createCategoryElement(className, "New Child Category");
 		$children.append($li);
 		$li.click(selectClickedCat);
 		$li.trigger("click");
 		$li.find("span").trigger("click");
 		// same as first ccase but it's child-tree
 	} else if ($selected.hasClass("child-tree")) {
 		// just notify user that category tree can only be nested
 		// in a depth of 1 so unable to nest more (since it is a child tree.)
 		$("#notifying-modal .modal-title").text("Alert");
 		var content = "Unable to add category. " +
 					  "You are allowed only 1 depth of sub-category.";
		$("#notifying-modal .modal-body p").text(content);
		$("#show-notifying-modal").trigger("click");
 	}
 }

/* ********** Categories AJAX (PART2: ADD) (ABOVE) ********** */

/* ********** Categories AJAX (PART2: DELETE) (BELOW) ********** */
 /* Delete category on delete category button. 
  * case 1 (root category): notify user that it is unable to delete root category 
  * case 2 (parent category): notify user if really wants to delete all posts in
  *                           selected parent category
  *                           (including child categories associated with that) 
  * case 3 (child category): notify user if really wants to delete all posts in 
  *                          selected child category) */
 function notifyBeforeRemovingCategory() {
 	var $selected = $(".tree-selected");
 	console.log("$selected:");
 	console.log($selected);
 	if ($selected.hasClass("tree-root")) {
 		// TODO: notify user that it is unable to remove root category
 		$("#notifying-modal .modal-title").text("Notification");
 		$("#notifying-modal .modal-body p").text("Unable to delete a root category.");
 		$(".delete-cat").hide();
 		$("#show-notifying-modal").trigger("click");
 	} else if ($selected.hasClass("parent-tree")) {
 		// TODO: notify user that all posts in parent category and in 
 		//       child categories associated with selected category will be
 		//        deleted.
 		$("#notifying-modal .modal-title").text("Delete Parent Category");
 		$("#notifying-modal .modal-body p").text("All posts in a selected category " + 
 			"and in child categories will be deleted. Do you really want to delete?");
 		$("#show-notifying-modal").trigger("click");
 		$(".delete-cat").removeClass("delete-child-cat");
 		$(".delete-cat").addClass("delete-parent-cat");
 		$(".delete-cat").show();
 		$(".delete-parent-cat").click(function() {
 			recordDeletingCat();
 		});
 	} else if ($selected.hasClass("child-tree")) {
 		// TODO: notify user that all posts in child category will be deleted.
 		$("#notifying-modal .modal-title").text("Delete Child Category");
 		$("#notifying-modal .modal-body p").text("All posts in a selected category " + 
 			"will be deleted. Do you really want to delete?");
 		$("#show-notifying-modal").trigger("click");
 		$(".delete-cat").removeClass("delete-parent-cat");
 		$(".delete-cat").addClass("delete-child-cat");
 		$(".delete-cat").show();
 		$(".delete-child-cat").click(function() {
 			recordDeletingCat();
 		});
 	}
 }

 function recordDeletingCat() {
 	var $selected = $(".tree-selected");
 	var $span = $selected.find("span");
	saveChangeInCategory($span, "", "delete-category");
	$selected.removeClass("tree-selected")
	$selected.remove();
 }

/* ********** Categories AJAX (PART2: DELETE) (ABOVE) ********** */

/* ********** Friends AJAX *********** (BELOW) */

//@@@@TODO:: Change Friends loading strategy
function getFriendsInfo(keyword, offset) {
	$.ajax({
		type: "POST",
		url: "/acc-friends",
		contentType: "application/json",
		dataType: "JSON",
		data: JSON.stringify({keyword: keyword, offset: offset}),
    	success: function(res) {
    		if (res.msg) { //in case of query error.
    			alert(res.msg);
    		} else {
    			var friends = res;
    			var $fDisplay = $(".display-friends");
    			var i;
    			for (i = 0; i < friends.length; i++) {
    				$fDisplay.append(createFriendBlock(friends[i]));
    			}
    			friendOffset += i;

    			var $expand = $(".friend-expand-btn button");
    			if (friends.length < 5) $expand.addClass("disabled");
    			else $expand.removeClass("disabled");

    		}
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

function createFriendBlock(fInfo) {
	var $friend = $("<div>", {class: "each-friend"});

	var fname = fInfo.first_name.toLowerCase().replace(/\s+/, "");
	var $a = $("<a>", {
		class: "each-friend-link",
		href: "/blog/" + fname + "-" + fInfo.uid
	});
	var $box = $("<div>", {class: "each-friend-box"});

	var nickname = fInfo.nick_name;
	var profile = (fInfo.profile) ? "./uploads/" + info.profile:
									"./assets/images/default-profile.gif" 
	var $img = $("<img>", {
		src: profile,
		class: "img-thumbnail",
		alt: nickname
	});
	var $span = $("<span>", {text: nickname});

	$box.append($img, $span);
	$a.append($box);
	$friend.append($a);
	return $friend;
}

/* ********** Friends AJAX *********** (ABOVE) */

/* ********** Managements AJAX *********** (BELOW) */

// Submit editted management infos.
function submitManagementInfo() {
	$("form#manage-form").submit(function(e) {
		e.preventDefault();

		//Get form data
		var formData = new FormData($("#manage-form")[0]);

		var headerColor = $("#header-color-picker").spectrum("get").toHexString();
		formData.set("header_color", headerColor);

		formData.set("footer_sent", $(".footer-sent input").val());
		formData.set("blog_title", $(".blog-title input").val());

		//set contentType to false in order to prevent the boundary string from being
		// missed from it.
		//set processData to false in order to prevent Jquery from automatically
		// transforming the data into a query string.
		$.ajax({
			type: "POST",
			url: "/submit-manage-edit",
			data: formData,
	    	contentType: false,
	    	processData: false,
	    	success: function(res) {
	    		console.log(res);

	    		if (res.msg) {
	    			alert(res.msg);
	    		} else {
	    			disableManagementOptions();
	    		}


	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	});
}

/* ********** Managements AJAX *********** (ABOVE) */

/* ********** Modify Password AJAX *********** (BELOW) */

function matchNewPasswordBeforeSubmit() {

}

var countdown;

function submitModifyPassword() {
	$("form#verify-mp-code").submit(function(e) {
		e.preventDefault();
		var $verifyReqMsg = $(".msg-verify-pass");
		$verifyReqMsg.addClass("unmatch");
		$verifyReqMsg.show();
		$verifyReqMsg.text("Password Modification is not requested yet.");
	});

	$("#modify-pass-form").submit(function(e) {
		e.preventDefault();
		showLoader("body");
		var $passReqMsg = $(".msg-pass-req");
		$passReqMsg.show();
		if ($("input[name='new-pass']").val() === $("input[name='re-new-pass']").val()) {
			var data = {old_password: $("input[name='current-pass']").val(),
						password: $("input[name='new-pass']").val(), 
				    	nick_name: $("input[name='nickname']").val(),
						email: $("input[name='email']").val()};
			$.ajax({
				type: "POST",
				url: "/submit-modify-pass",
		    	contentType: "application/json",
				dataType: "JSON",
				data: JSON.stringify(data),
		    	success: function(res) {
		    		hideLoader("body");
		    		if (res.msg) {
		    			alert(res.msg);
		    		} else if (res.wrong) {
		    			$passReqMsg.addClass("unmatch");
						$passReqMsg.text("Current password is not correct. Please try again.");
		    		} else {
		    			$passReqMsg.removeClass("unmatch");
		    			$passReqMsg.text("Verification email has been sent." + 
		    				" Please type a verification code below.");

		    			var $verifyReqMsg = $(".msg-verify-pass");
		    			$verifyReqMsg.removeClass("unmatch");
		    			$verifyReqMsg.hide();
		    		
		    			var timeout = 5 * 60 * 1000;

		    			$("#modify-pass-timer").show();
			            countdown = setInterval(function() {
			            	var min = Math.floor(timeout / (1000 * 60));
			            	var sec = Math.floor((timeout % (1000 * 60)) / 1000);

			            	if (sec < 10) {
			            		sec = "0" + sec;
			            	}

			            	$("#modify-pass-timer .time").text("0" + min + ":" + sec);
			            	timeout = timeout - 1000;

			            	if (timeout < 0) {
			            		clearInterval(countdown);
			            		requestDeleteSessionCode($verifyReqMsg);
			            	}
			            }, 1000);

			            //add handler for verifying code.
			    		$("form#verify-mp-code").submit(function(e) {
			    			e.preventDefault();
			    			var verified = false;
			    			var typedCode = $("input[name='mp-code']").val();
			    			if (typedCode === res.sess.code) {
			    				verified = true;
			    			}
			    			submitVerifyModifyPassword(res.sess.infos.password, verified);
			    		});
		    		}
		    	},
		    	error(jqXHR, status, errorThrown) {
		    		console.log(jqXHR);
		    	}
			});
		} else {
			$passReqMsg.addClass("unmatch");
			$passReqMsg.text("New passwords are not matched. Please try again.");
		}
	});
}

function requestDeleteSessionCode($verifyMsg) {
	$.ajax({
		type: "GET",
		url: "/delete-verif-code",
		contentType: "application/json",
		dataType: "JSON",
		success: function(res) {
    		if (res.msg) {
    			alert(res.msg);
    		} else {
    			$verifyMsg.addClass("unmatch");
        		$verifyMsg.show();
        		$verifyMsg.text("Timeout. Please request again.");
    		}
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

function submitVerifyModifyPassword(password, isVerified) {
	var $verifyMsg = $(".msg-verify-pass");
	$verifyMsg.show();
	if (isVerified) {
		var data = {password: password};
		$.ajax({
			type: "POST",
			url: "/update-password",
	    	contentType: "application/json",
			dataType: "JSON",
			data: JSON.stringify(data),
	    	success: function(res) {
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else {
	    			clearInterval(countdown);
	    			$("#modify-pass-timer").hide();
	    			$verifyMsg.removeClass("unmatch");
	    			$verifyMsg.show();
	    			$verifyMsg.text("Password is successfully changed!");
	    			setTimeout(function() {
	    				$verifyMsg.hide();
	    				$(".msg-pass-req").hide();
	    			}, 5000);
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	} else {
		$verifyMsg.addClass("unmatch");
		$verifyMsg.text("Wrong verification code. Please try again.");
	}
}


/* ********** Modify Password AJAX *********** (ABOVE) */

/* ********** Delete Account AJAX *********** (BELOW) */
var delAccCountDown;

function submitDeleteAccount() {
	$("form#verify-da-code").submit(function(e) {
		e.preventDefault();
		var $verifyReqMsg = $(".msg-verify-del");
		$verifyReqMsg.addClass("unmatch");
		$verifyReqMsg.show();
		$verifyReqMsg.text("'Account Delete' is not requested yet.");
	});

	$("#delete-account-form").submit(function(e) {
		e.preventDefault();
		showLoader("body");
		var $delReqMsg = $(".msg-del-acc");
		$delReqMsg.show();
		// since server is using same function as Modifying Password use,
		//  key of password must be old_password in order to meet protocol.
		var data = {old_password: $("input[name='confirm-pass']").val(),
					email: $("input[name='confirm-email']").val(),
					nick_name: $("input[name='nickname']").val()};
	    $.ajax({
			type: "POST",
			url: "/request-del-acc",
	    	contentType: "application/json",
			dataType: "JSON",
			data: JSON.stringify(data),
	    	success: function(res) {
	    		hideLoader("body");
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else if (res.wrong) {
	    			$delReqMsg.addClass("unmatch");
					$delReqMsg.text("Email or password is not correct. Please try again.");
	    		} else {
	    			$delReqMsg.removeClass("unmatch");
	    			$delReqMsg.text("Verification email has been sent." + 
	    				" Please type a verification code below.");

	    			var $verifyReqMsg = $(".msg-verify-del");
	    			$verifyReqMsg.removeClass("unmatch");
	    			$verifyReqMsg.hide();
	    		
	    			var timeout = 5 * 60 * 1000;

	    			$("#del-acc-timer").show();
		            delAccCountDown = setInterval(function() {
		            	var min = Math.floor(timeout / (1000 * 60));
		            	var sec = Math.floor((timeout % (1000 * 60)) / 1000);

		            	if (sec < 10) {
		            		sec = "0" + sec;
		            	}

		            	$("#del-acc-timer .time").text("0" + min + ":" + sec);
		            	timeout = timeout - 1000;

		            	if (timeout < 0) {
		            		clearInterval(delAccCountDown);
		            		requestDeleteSessionCode($verifyReqMsg);
		            	}
		            }, 1000);

		            //add handler for verifying code.
		    		$("form#verify-da-code").submit(function(e) {
		    			e.preventDefault();
		    			var verified = false;
		    			var typedCode = $("input[name='da-code']").val();
		    			if (typedCode === res.sess.code) {
		    				verified = true;
		    			}
		    			submitVerifyDeleteAccount(verified);
		    		});
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	});
}


//change it to GET AJAX
function submitVerifyDeleteAccount(isVerified) {
	var $verifyMsg = $(".msg-verify-del");
	$verifyMsg.show();
	if (isVerified) {
		$.ajax({
			type: "GET",
			url: "/delete-account",
	    	contentType: "application/json",
			dataType: "JSON",
	    	success: function(res) {
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else {
	    			$verifyMsg.hide();
	    			clearInterval(delAccCountDown);
	    			alert("Account has been deleted successfully. " + 
	    				"Thank you for using A Lifelogger. We hope you to be back soon.");
	    			window.location.href = "/";
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	} else {
		$verifyMsg.addClass("unmatch");
		$verifyMsg.text("Wrong verification code. Please try again.");
	}
}


/* ********** Delete Account AJAX *********** (ABOVE) */
