$(document).ready(function() {
	var pageUid;
	var pagePostid;
	var isMyBlog = true;

	var parseUrl = window.location.href.match(/\/blog\/(\w+)-(\d+)\/post-(\d+)/);
	pageUid = parseUrl[2];
	pagePostid = parseUrl[3];
	$.ajax({
		type: "GET",
		url: "/check-user-login",
    	contentType: "application/json",
		dataType: "JSON",
    	success: function(res) {
    		if (res.msg) {
    			alert(res.msg);
    		} else {
    			console.log(res);
    			if (res[0].uid != pageUid) {
    				isMyBlog = false;
    				$("#post-edit-btn").hide();
    			}
    			getPostInfo();

    		}
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});


	function getPostInfo() {
		test = parseUrl;
		$.ajax({
			type: "GET",
			url: "/post/uid-" + pageUid + "/postid-" + pagePostid,
	    	contentType: "application/json",
			dataType: "JSON",
	    	success: function(res) {
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else {
	    			var info = res[0];
	    			$("#post-title").text(info.title);
	    			var lastEdit = new Date(info.last_edit);
	    			$("#post-info").text("Last Edited: " + lastEdit.toUTCString());
	    			$("#post-contents").html(info.contents);

	    			$("#post-edit-btn").click(function(e) {
						e.preventDefault();
						window.location.href = "/write-post?edit=" + pagePostid;
					});
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}
});