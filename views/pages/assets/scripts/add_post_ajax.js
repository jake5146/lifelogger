// javascript ajax handler for add_post.html
$(document).ready(function() {
	//close add post when remove-icon or cancel is clicked
	$(".close-addpost").click(function() {
		window.location.replace("/mypage");
	});

	getCategoryOptions();

	//var category;
	function getCategoryOptions() {
		$.ajax({
			type: "GET",
			url: "/acc-categories",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	success: function(res) {
	            console.log(res);
	            var category = organizeCategories(res);
	            console.log(category);
	            addCategoryOptions(category);

	    	},
	    	error(jqXHR, status, errorThrown) {
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

	$("#add-post").submit(function(e) {
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

		$.ajax({
			type: "POST",
			url: "/add-post",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify(postData),
	    	success: function(res) {
	            if (res.msg) {
	            	alert("Sorry, error occurs during the process. Please try again.");
	            } else if (res.sessErr) {
	            	alert(res.sessErr);
	            } else { //success
	            	window.location.href = "/mypage";
	            }
	            
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});



	});
});