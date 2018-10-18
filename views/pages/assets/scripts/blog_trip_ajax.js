$(document).ready(function() {
	getBlogTripInfo();

	var offset = 0;
	function getBlogTripInfo() {
		$.ajax({
			type: "POST",
			url: "/blog-trip-info",
			contentType: "application/JSON",
			dataType: "JSON",
			data: JSON.stringify({keyword: "", offset: 0}),
			success: function(res) {
				if (res.msg) {
					alert(res.msg);
				} else if (res.sessErr) {
					alert(res.sessErr);
				} else {
					console.log(res);
					// number of unavailable best blogs (because of lack of users)
					var numNa = (res.length < 5) ? 5 - res.length: 0;
					var i;
					for (i = 0; i < 5 - numNa; i++) {
						appendCarouselItemContents(res[i], i);
					}

					var defaultContent = {
						blog_title: "Empty Best Blog Seat"
					};

					var j;
					for (j = i; j < 5; j++) {
						appendCarouselItemContents(defaultContent, j);
					}

					//display blog info
					if (res.length < 10) $(".expand-list-btn button").addClass("disabled");
					var k;
					for (k = 0; k < res.length; k++) {
						offset++;
						appendBlogListItem(res[k]);
					}

					$(".blog-search input").keyup(function() {
						offset = 0;
						searchBlogFunction(true, 0);
					});

					$(".expand-list-btn button").click(function() {
						searchBlogFunction(false, offset);
					});

				}
			},
			error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	function appendCarouselItemContents(info, i) {
		var src = (info.header_bg) ? 
				  "../../uploads/" + info.header_bg: "assets/images/bg-header-default.jpg";
		var title = (info.blog_title) ? info.blog_title: info.nick_name + "'s Blog";
		var $img = $("<img>", {
			src: src,
			alt: title
		});

		var $caption = $("<div>", {class: "carousel-caption"});
		var $h2 = $("<h2>", {text: title});

		var about = (info.about) ? info.about.substring(0, 20) + "...": "";
		var $p = $("<p>", {text: about});

		$caption.append($h2, $p);

		$("#best-blog-carousel .carousel-inner .item-" + i).append($img, $caption);
	}

	function appendBlogListItem(info) {
		var href = "/blog/" + 
        			info.first_name.toLowerCase().replace(/\s+/, "") + 
        			"-" + info.uid;
        var $blog = $("<a>", {
        	href: href,
        	class: "each-blog"
        });

        var $profile = $("<div>", {class: "blog-inline profile"});

        var $block1 = $("<div>", {class: "blog-block"});

        var profileSrc = (info.profile) ? "uploads/" + info.profile:
        								  "assets/images/default-profile.gif";
        var $profileImg = $("<img>", {
        	class: "profile-img",
        	src: profileSrc,
        	alt: "Profile Image"
        });

        var $nickName = $("<span>", {
        	class: "nickname",
        	text: info.nick_name
        });

        $block1.append($profileImg, $nickName);

        var $block2 = $("<div>", {class: "blog-block"});
        var $about = $("<p>", {
        	class: "about",
        	text: (info.about) ? info.about: 
        						"Visit to " + info.nick_name + "'s Blog."
        });
        $block2.append($about);

        $profile.append($block1, $block2);

        var $headerBg = $("<div>", {class: "blog-inline header-bg"});
        
        var headerSrc = (info.header_bg) ? "uploads/" + info.header_bg:
        								   "assets/images/bg-header-default.jpg";
        var $headerImg = $("<img>", {
        	class: "blog-header",
        	src: headerSrc,
        	alt: "Header Image"
        });

        $headerBg.append($headerImg);

        $blog.append($profile, $headerBg);

        $(".blog-lists").append($blog);
	}

	function searchBlogFunction(isSearch, offset) {
		$.ajax({
			type: "POST",
			url: "/blog-trip-info",
			contentType: "application/JSON",
			dataType: "JSON",
			data: JSON.stringify({keyword: $(".blog-search input").val(),
								  offset: offset}),
			success: function(res) {
				if (res.msg) {
					alert(res.msg);
				} else if (res.sessErr) {
					alert(res.sessErr);
				} else {
					//display blog info
					if (res.length < 10) $(".expand-list-btn button").addClass("disabled");
					else $(".expand-list-btn button").removeClass("disabled");

					if (isSearch) $(".blog-lists").empty();
					var i;
					for (i = 0; i < res.length; i++) {
						offset++;
						appendBlogListItem(res[i]);
					}
				}
			},
			error: function(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}
});