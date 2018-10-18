window.onbeforeunload = function (e) {
    return "You will lose the saved data if you leave. Do you really want to leave this page?";
};

// javascript ajax handler for add_post.html
$(document).ready(function() {
	//close add post when remove-icon or cancel is clicked
	var pageFname, pageUid;
	var curPostid = undefined;
	var isEdit = false;

	$.ajax({
		type: "GET",
		url: "/check-user-login",
    	contentType: "application/json",
		dataType: "JSON",
    	success: function(res) {
    		if (res.msg) {
    			alert(res.msg + " Redirecting to the main page.");
	            window.location.href = "/";
    		} else {
    			pageFname = res[0].first_name.toLowerCase().replace(/\s+/, "");
    			pageUid = res[0].uid;
    			getCategoryOptions();
    		}
    	},
    	error: function(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});

	//var category;
	function getCategoryOptions() {
		$.ajax({
			type: "POST",
			url: "/acc-categories",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify({uid: undefined}),
	    	success: function(res) {
	            console.log(res);
	            var category = organizeCategories(res);
	            console.log(category);
	            addCategoryOptions(category);
	            loadExistingPostOnEdit();

	    	},
	    	error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	function addCategoryOptions(category) {
		var parents = category[0];
	    var pToC = category[1];
	    
	    var $select = $(".select-categories");

	    var $all = $("<option>", {
	    	value: "all",
	    	text: "All"
	    });

	    $select.append($all);

	    var pcids = Object.keys(parents).map(x => parseInt(x));
	    pcids = pcids.sort(sortFcn); 
	    $.each(pcids, function(i, val) {
	    	var $pOpt = $("<option>", {
	    		value: "parent-" + val,
	    		class: "parent",
	    		text: parents[val]
	    	});

	    	$select.append($pOpt);

	    	var children = pToC[val];
	    	if (children) {
	    		var ccids = Object.keys(children).map(x => parseInt(x));
	    		ccids = ccids.sort(sortFcn);
	    		$.each(ccids, function(j, cval) {
	    			var $cOpt = $("<option>", {
	    				value: "child-" + cval,
	    				text: "\u21B3 " + children[cval]
	    			});

	    			$select.append($cOpt);
	    		});
	    	}
	    });
	}

	function loadExistingPostOnEdit() {
		var mypageUrl = "/blog/" + pageFname + "-" + pageUid;
		var parseUrl = window.location.href.match(/\?(edit)=(\d+)/);
		if (parseUrl) {
			curPostid = parseUrl[2];
			$.ajax({
				type: "POST",
				url: "/load-post",
		    	contentType: "application/json",
		    	dataType: "JSON",
		    	data: JSON.stringify({postid: curPostid}),
		    	success: function(res) {
		            console.log(res);
		            isEdit = true;

		            var info = res[0];
		            var cat = "all";
		            if (info.pcid) cat = "parent-" + info.pcid;
		            if (info.ccid) cat = "child-" + info.ccid;

		            //select category
		            $("select.select-categories").val(cat);

		            $("input[name='post-title']").val(info.title);

		            $("div.display-area").html(info.contents);

		            $("input[type='submit']").val("Edit");
		            $("input[type='submit']").addClass("submit-edit-post");

		            $("#add-post").submit(function(e) {
						submitPost(e, "/edit-post", curPostid);
					});

					$(".close-addpost").click(function() {
						window.location.replace(mypageUrl + "/post-" + curPostid);
					});
		    	},
		    	error: function(jqXHR, status, errorThrown) {
		    		console.log(jqXHR);
		    	}
			});
		} else {
			$("#add-post").submit(function(e) {
				submitPost(e, "/add-post", undefined);
			});

			$(".close-addpost").click(function() {
				window.location.replace(mypageUrl);
			});
		}
	}

	function uploadFiles() {
		var files = $("input[name='add-picture']")[0].files;

		console.log(files);

		sel = window.getSelection();
		sel.removeAllRanges();
		if (rang) sel.addRange(rang);

		function uploadEach(file) {
			if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
				var reader = new FileReader();

				reader.addEventListener("load", function() {
					document.execCommand("insertParagraph");
					document.execCommand("insertImage", false, this.result);
				}, false);

				if (file) {
					reader.readAsDataURL(file);
				}
			}
		}

		if (files) {
			[].forEach.call(files, uploadEach);
		}
	}

	$("input[name='add-picture']").change(uploadFiles);

	function submitPost(e, url, postid) {
		e.preventDefault();
		var postData = {};

		var title = $("input[name='post-title']").val();
		console.log(title);
		if (title === "") {
			alert("Please write a title with 5 or more words.");
			return;
		}

		var contents = $(".display-area").html();

		var $selected = $(".select-categories").find(":selected");
		var cid = $selected.val(); 
		if (cid.indexOf("parent-") !== -1) {
			postData.pcid = parseInt(cid.substring(cid.length - 1));
		} else if (cid.indexOf("child-") !== -1) {
			postData.ccid = parseInt(cid.substring(cid.length - 1));
			var pcid = $($selected.prevAll(".parent")[0]).val();
			postData.pcid = parseInt(pcid.substring(pcid.length - 1));
		}

		postData.title = title;
		postData.contents = contents;
		postData.temporary = 0;

		if (postid) postData.postid = postid;

		$.ajax({
			type: "POST",
			url: url,
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify(postData),
	    	success: function(res) {
	            if (res.msg) {
	            	alert("Sorry, error occurs during the process. Please try again.");
	            } else if (res.sessErr) {
	            	alert(res.sessErr + " Redirecting to the main page.");
	            	window.location.href = "/";
	            } else { //success
	            	var moveToUrl = res.url;
	            	if (isEdit) {
	            		moveToUrl += "/post-" + curPostid;
	            	}
	            	window.location.href = moveToUrl;
	            }
	            
	    	},
	    	error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}
});