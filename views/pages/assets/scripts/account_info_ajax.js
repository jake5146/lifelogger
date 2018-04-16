$(document).ready(function() {
	hideMessages();
	getProfileInfo();
	submitProfileInfo();

	getCategoryInfo();
	submitEdittedCategoryNames();
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
function getProfileInfo() {
	$.ajax({
		type: "GET",
		url: "/acc-profile",
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

		formData.set("phone", phone ? phone: null);
		formData.set("about", about ? about: null);


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
//var category;
function getCategoryInfo() {
	$.ajax({
		type: "GET",
		url: "/acc-categories",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
            console.log(res);
            //organizeCategories: refer to helper_functions.js
            category = organizeCategories(res);
            console.log(category);
            displayExistingCategories(category);

            $("li.parent-tree, li.child-tree, li.tree-root").click(selectClickedCat);

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
	$("li.child-tree, li.parent-tree, li.tree-root").removeClass("tree-selected");
	if (!$(this).hasClass("tree-selected")) {
		$(this).addClass("tree-selected");
	}

	$("li.tree-selected:not(.tree-root) > div.list span").click(function(e) {
		e.stopPropagation();
		var $li = $(this).parent().parent().parent();
		if ($li.hasClass("tree-selected")) {
			$li.addClass("tree-edittable");
		}
		$("li.child-tree, li.parent-tree, li.tree-root").removeClass("tree-selected");
		$li.addClass("tree-selected");
		console.log("tree-selected added");
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
	editCategoryName($span, $input.val());
	$input.remove();
	$li.removeClass("tree-edittable");
}

/* Apply editted category's name on user's interface, and save this info
 * to input[name='add-category'] in JSON format to POST it to server later. */
function editCategoryName($span, catName) {
	var $addInput = $("input[name='add-category']");
	var addCatJson = $addInput.val();
	console.log(addCatJson);
	if (addCatJson.length === 0) {
		addCatJson = {};
		addCatJson.pcid = {};
		addCatJson.ccid = {};
	} else {
		addCatJson = JSON.parse(addCatJson);
	}

    $(".msg-category").hide();
	var display = document.getElementById("display-block");
	var $li = $span.closest(".tree-node", display);
	console.log($li);
	if ($li.length > 0) {
		var classes = $li.attr("class").split(/\s+/);
		var cid = classes.filter(function(val) {
			return val.indexOf("tree-id-") != -1;
		});
		cid = cid[0].replace("tree-id-", "");

		if (classes.indexOf("parent-tree") === -1) {
			addCatJson.ccid[cid] = catName;
		} else {
			addCatJson.pcid[cid] = catName;
		}
		console.log(addCatJson);
        
        $addInput.val(JSON.stringify(addCatJson));
        console.log($addInput.val());
	} else {
		$(".msg-category").show();
		$(".msg-category").text("Error occurs during processing requested task.");
	}
}

/* POST editted names of categories to the server. */
function submitEdittedCategoryNames() {
	$("#apply-cat-edit").click(function(e) {
		e.preventDefault();
		showLoader("body");

		$.ajax({
			type: "POST",
			url: "/submit-category-edit",
			contentType: "application/json",
			dataType: "JSON",
			data: $("input[name='add-category']").val(),
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

 }

/* ********** Categories AJAX (PART2: ADD) (ABOVE) ********** */