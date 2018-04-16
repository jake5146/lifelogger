// ajax request handler for blog_mypage.html
$(document).ready(function() {
	getProfileInfo();
	//getPostsInfo();
	getCategoryInfos();
	getBlogLikes();

	function getProfileInfo() {
		$.ajax({
			type: "GET",
			url: "/acc-profile",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	success: function(res) {
	            var info = res;

	            console.log(info);

	            if (info.msg || info.invalid) {
	            	alert("Sorry. Error occurred during loading information." +
	            		" Please try again.");
	            } else {
	            	var fullname = info.first_name;
	            	if (info.middle_name) {
	            		fullname += " " + info.middle_name;
	            	}
	            	fullname += " " + info.last_name;

	            	$(".fullname").text(getFullName(info.first_name, 
	            									info.middle_name, 
	            									info.last_name));
	            	$(".gender").text(info.gender);
	            	$(".nickname").text(info.nick_name);
	            	$(".birthday").text(getDate(info.birthday));
	            	$(".about").text(info.about);

	            	// blog headers:
	            	if (info.blog_title) {
	            		$("h1.blog-title").text(info.blog_title);
	            	}
	            	if (info.header_color) {
	            		$("h1.blog-title").css({"color": info.header_color});
	            	}
	            	if (info.header_bg) {
	            		$(".jumbotron").css({"background-image": "url('" + info.header_bg + "')"});
	            	}
	            	if (info.footer_sent) {
	            		$("#impressive-sent").text(info.footer_sent);
	            	}

	                
	                if (info.profile) {
	                	$("#profile-img").attr("src", "./uploads/" + info.profile);
	                }
	            }
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	/* Uploads header background (BELOW) */
	$("#header-bg").change(function() {
		console.log(this.files);
		$(".jumbotron").css({"background-image": "url('" + this.files[0].url + "')"});
	});
	/* Uploads header background (ABOVE) */

	var curStartOffset;
	var curPcid;
	var curCcid;
	var curDispType;
	/* Send category info (ex. pcid: #, ccid: #), cid, start and end indices of posts, 
	 * and get corresponding data from the server */
	function getPostsInfo(startOffset, pcid, ccid, displayType) {
		showLoader("body");
		var data = {"startOffset": startOffset, "pcid": pcid, "ccid": ccid};
		$.ajax({
			type: "POST",
			url: "/post-info",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify(data),
	    	success: function(res) {
	    		//infos refer to list of rows (Posts infos)
	            var posts = res;
	            console.log(posts);

	            if (res.sessErr) {
	            	alert(res.sessErr);
	            } else {
	            	curStartOffset = startOffset;
		            curPcid = pcid;
		            curCcid = ccid;
		            curDispType = displayType;
		            displayPosts(posts, startOffset, displayType);
		            hideLoader("body");
	            }
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	function hideDefaultWhenNoPost(isDefault) {
		if (!isDefault) {
        	$(".default-content").hide();
        	$(".addpost-button").show();
        } else {
        	$(".addpost-button").hide();
        	$(".default-content").show();
        }
	}

	function displayPosts(posts, startOffset, displayType) {
		var $shown = $(".post.shown");
		$("#postings").empty();
		var num;
		switch(displayType) {
			case "block":
				num = displayPostsInBlocks(posts, startOffset);
				break;
			case "link":
				console.log("in link");
				num = displayPostsInLinks(posts, startOffset);
				break;
		}

		hideDefaultWhenNoPost(num === 0);

		if (num > 0) {
			createPagination(num, startOffset, $shown);
			initPagination($shown);
			paginationEventHandler();
		}
	}

	function displayPostsInLinks(posts, startOffset) {
		var num = startOffset;
		var $divResp = $("<div>", {
			class: "table-responsive"
		});

		var $table = $("<table>", {
			class: "table table-hover"
		});

		var $tbody = $("<tbody>");

		
		$.each(posts, function(i, post) {
			num++;
			$tbody.prepend(createPostLink(post, num));
		});

		$table.append($tbody);
		$divResp.append($table);

		$("#postings").append($divResp);
		return num;
	}

	function createPostLink(post, num) {
		var pageNum = Math.floor((num - 1) / 10) + 1;

		var $tr = $("<tr>", {
			class: "post post-" + post.postid + 
				   " page-" + pageNum
		});

		var $td_num = $("<td>", {
			class: "post-order",
			text: "" + num
		});
		var $td_title = $("<td>", {
			class: "post-title",
			text: post.title
		});
		var $td_date = $("<td>", {
			class: "post-date",
			text: getDate(post.time_post)
		});

		$tr.append($td_num, $td_title, $td_date);

		return $tr;
	}

	function displayPostsInBlocks(posts, startOffset) {
		var num = startOffset;
		var $divPosts = $("<div>", {
			class: "post-blocks"
		});

		var i = 0;
		console.log("posts.length:" + posts.length);
		while (i < posts.length) {
			var $row = $("<div>", {class: "row"});
			var $margin1 = $("<div>", {class: "col-xs-1"});
			var $post1 = createPostBlock(posts[i], num + 1);
			if ((posts.length - i) === 1) {
				$margin = $("<div>", {class: "col-xs-7"});
				$row.append($margin, $post1);
				i++;
				num++;
			} else {
				var $margin2 = $("<div>", {class: "col-xs-2"});
				var $post2 = createPostBlock(posts[i+1], num + 2);
				$row.append($margin1, $post2, $margin2, $post1);
				i = i + 2;
				num = num + 2;
			}
			$divPosts.prepend($row);
		}
		console.log("posts:");
		console.log(posts);
		console.log("i:" + i);

		console.log($divPosts);
		$("#postings").append($divPosts);
		return num;
	}

	function createPostBlock(post, num) {
		var pageNum = Math.floor((num - 1) / 10) + 1;

		var $post = $("<div>", {
			class: "col-xs-4 post post-" + post.postid +
				   " page-" + pageNum
		});

		var $div = $("<div>", {class: "thumbnail"});

		var $a = $("<a>", {
			href: "#"
		});

		var $temp = $("<div>");
		$temp.html(post.contents);
		var $firstImg = $temp.find("img").first();

		var imgSrc;
		if ($firstImg.length) {
			imgSrc = $firstImg.attr("src");
		} else {
			imgSrc = "assets/images/no-image-icon.png";
		}

		var $img = $("<img>", {
			src: imgSrc,
			alt: "Post-" + post.postid,
			height: "60%",
			width: "60%"
		});

		var $title = $("<div>", {
			class: "post-title",
			text: post.title
		});

		$a.append($img, $title);
		$div.append($a);
		$post.append($div);
		return $post;
	}

	function createPagination(num, startOffset, $shown) {
		var $ulList = $("<ul>", {
			class: "page-list pagination pagination-sm"
		});

		var liDoubleL = createPageLink("left-arrow left-double-arrow", 
									   "<span class='glyphicon" + 
									   " glyphicon-backward'></span>");
		var liSingL = createPageLink("left-arrow left-single-arrow",
									 "<span class='glyphicon" + 
									 " glyphicon-triangle-left'></span>");

		$ulList.append(liDoubleL, liSingL);

		var pagesNum = Math.ceil(num / 10);

		var countPg = (pagesNum > 5) ? pagesNum - 5: 0;

		var n = startOffset;
		while (countPg < pagesNum) {
			countPg++;
			var liClasses = "page page-" + countPg;
			var $li = createPageLink(liClasses, countPg);
			$ulList.append($li);
		}

		var liSingR = createPageLink("right-arrow right-single-arrow",
									 "<span class='glyphicon" + 
									 " glyphicon-triangle-right'></span>");
		var liDoubleR = createPageLink("right-arrow right-double-arrow", 
									   "<span class='glyphicon" + 
									   " glyphicon-forward'></span>");

		$ulList.append(liSingR, liDoubleR);

		$("#postings").append($ulList);
	}

	function createPageLink(className, linkContent) {
		return "<li class='" + className + "'>" +
					"<a href='#'>" + 
						linkContent +
					"</a>" +
				"</li>";
	}

	function initPagination($shown) {
		var limit = findLimit();

		if (curStartOffset >= 50) {
			$("li.left-arrow").removeClass("disabled");
		} else {
			$("li.left-arrow").addClass("disabled");
		}

		if ((curStartOffset + 50) >= limit) {
			$("li.right-arrow").addClass("disabled");
		} else {
			$("li.right-arrow").removeClass("disabled");
		}

		$(".post").hide();

		if ($shown.length) {
			var pgToBeShown = Math.floor(curStartOffset / 10) + 1;
			$("li.page-" + pgToBeShown).show();
			$("li.page-" + pgToBeShown).addClass("active");
			$(".post.page-" + pgToBeShown).addClass("shown");
			$(".post.page-" + pgToBeShown).show();
		} else {
			$("li.page-1").addClass("active");
			$(".post.page-1").addClass("shown");
			$(".post.page-1").show();
		}
	}

	function findLimit() {
		var parent = (curPcid) ? ".parent-" + curPcid: "";
		var child = (curCcid) ? ".child-" + curCcid: "";
		var cat = (parent || child) ? parent + child: ".all";
		return parseInt($($("li" + cat + " span.badge")[0]).text());
	}

	function paginationEventHandler() {
		$("li.left-double-arrow").click(function(e) {
			e.preventDefault();
			if (!$(this).hasClass("disabled")) {
				console.log(curDispType);
				getPostsInfo(0, curPcid, curCcid, curDispType);
			}
		});

		$("li.left-single-arrow").click(function(e) {
			e.preventDefault();
			if (!$(this).hasClass("disabled")) {
				console.log(curDispType);
				getPostsInfo(curStartOffset - 50, curPcid, curCcid, curDispType);
			}
		});

		$("li.right-double-arrow").click(function(e) {
			e.preventDefault();
			var limit = findLimit();
			var lastPosts = limit % 50;
			var offset = (!lastPosts) ? limit - 50: limit - lastPosts;
			if (!$(this).hasClass("disabled")) {
				console.log(curDispType);
				getPostsInfo(offset, curPcid, curCcid, curDispType);
			}
		});

		$("li.right-single-arrow").click(function(e) {
			e.preventDefault();
			if (!$(this).hasClass("disabled")) {
				console.log(curDispType);
				getPostsInfo(curStartOffset + 50, curPcid, curCcid, curDispType);
			}
		});

		$("li.page").click(function(e) {
			var $curPg = $("li.page.active");
			var curPgNum = findNumber($curPg.attr("class"), "page-");
			$curPg.removeClass("active");
			$(".post.page-" + curPgNum).removeClass("shown");
			$(".post.page-" + curPgNum).hide();
			$(this).addClass("active");
			var pgNum = findNumber($(this).attr("class"), "page-");
			$(".post.page-" + pgNum).show();
			$(".post.page-" + pgNum).addClass("shown");
		});
	}


	function getCategoryInfos() {
		showLoader("body");
		$.ajax({
			type: "GET",
			url: "/acc-categories",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	success: function(res) {
	    		//@@
	    		console.log(res);
	            var category = organizeCategories(res);
	            addCategoryLinks(category);
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	function addCategoryLinks(category) {
		var parents = category[0];
	    var pToC = category[1];
	    
	    var pcids = Object.keys(parents).map(x => parseInt(x));
	    pcids = pcids.sort(sortFcn); 
	    getPostsCount(parents, pToC, pcids, -1, undefined, -1);
	}

	function getPostsCount(parents, pToC, pcidList, ipcid, ccidList, iccid) {
		$.ajax({
			type: "POST",
			url: "/post-count",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	data: JSON.stringify({"pcid": pcidList[ipcid], 
	    						  "ccid": (ccidList) ? ccidList[iccid]: undefined}),
	    	success: function(res) {
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else if (res.sessErr) { 
	    			alert(res.sessErr);
	    		} else {
	    			var count = res[0].count;
	    			if (iccid !== -1) {
	    				var pcid = pcidList[ipcid];
	    				var ccid = ccidList[iccid];
	    				var cClasses = "parent-" + pcid + 
	    							   " category child child-" + ccid;
	    				var $cLi = buildCategoryLink("\u21B3 " + pToC[pcid][ccid],
	    											 cClasses, "#", count);
	    				$("ul.category-body").append($cLi);
	    				if (iccid < ccidList.length - 1) {
							getPostsCount(parents, pToC, pcidList, ipcid, ccidList, iccid + 1);
	    				} else if (ipcid < pcidList.length - 1) {
	    					getPostsCount(parents, pToC, pcidList, ipcid + 1, undefined, -1);
	    				} else {
	    					finishGetPostCount();
	    				}
	    			} else if (ipcid !== -1) {
	    				var pcid = pcidList[ipcid];
	    				var pClasses = "category parent parent-" + pcid;
	    		    	var $pLi = buildCategoryLink(parents[pcid], pClasses, "#", count);

	    		    	$("ul.category-body").append($pLi);
	    		    	var children = pToC[pcid];
	    		    	if (children) {
	    		    		var ccids = Object.keys(children).map(x => parseInt(x));
	    		    		ccids = ccids.sort(sortFcn);
	    		    		getPostsCount(parents, pToC, pcidList, ipcid, ccids, iccid + 1);
	    		    	} else if (ipcid < pcidList.length - 1) {
	    		    		getPostsCount(parents, pToC, pcidList, ipcid + 1, undefined, -1);
	    		    	} else {
	    		    		finishGetPostCount();
	    		    	}
	    			} else {
	    				var $all = buildCategoryLink("All", "category all active", "#", count);
	    				$("ul.category-body").append($all);

	    				getPostsCount(parents, pToC, pcidList, ipcid + 1, undefined, -1);
	    			}
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	function finishGetPostCount() {
		var $edit = buildCategoryLink("Edit", "category-edit", "/account-info");
		$("ul.category-body").append($edit);
		switchActiveCategoryOnClick();
		getPostsInfo(0, undefined, undefined, "link");

		$(".sort-icon").click(function(e) {
			e.preventDefault();
			$(".sort-icon.sort-selected").removeClass("sort-selected");
			$(this).addClass("sort-selected");
			var displayType = ($(this).hasClass("display-list")) ? "link": "block";
			getPostsInfo(curStartOffset, curPcid, curCcid, displayType);
		});
	}

	function buildCategoryLink(name, classes, link, count) {
		var $li = $("<li>", {
			class: classes
		});

		var $a = $("<a>", {
			text: name,
			href: link
		});

		var $span = $("<span>", {
			class: "badge",
			text: count
		});

		$a.append($span);
		$li.append($a);
		return $li;
	}

	function switchActiveCategoryOnClick() {
		$(".category-body li.category").click(function(e) {
			e.stopPropagation();
			showLoader("body");
			$("li.category.active").removeClass("active");
			$(this).addClass("active");

			var classes = $(this).attr("class");
			// displayPosts(classes);
			// var pcid
			var pcid = findNumber(classes, "parent-");
			var ccid = findNumber(classes, "child-");
			getPostsInfo(0, pcid, ccid, curDispType);
		});
	}

	/* number of likes (BELOW) */

	function getBlogLikes() {
		$.ajax({
			type: "GET",
			url: "/get-likes",
	    	contentType: "application/json",
	    	dataType: "JSON",
	    	success: function(res) {
	    		if (res.msg) {
	    			alert(res.msg);
	    		} else if (res.sessErr) {
	    			alert(res.sessErr);
	    		} else {
	    			var likes = res[0].likes;
	    			$(".like-number").text(likes);
	    		}
	    	},
	    	error(jqXHR, status, errorThrown) {
	    		console.log(jqXHR);
	    	}
		});
	}

	/* number of likes (ABOVE) */


	/*  Helper functions (BELOW) */

	function findNumber(classes, filter) {
		var classesList = classes.split(/\s+/);
		var theClass = classesList.find(each => each.indexOf(filter) !== -1);
		return (!theClass) ? theClass: parseInt(theClass.replace(filter, ""));
	}

	/*  Helper functions (ABOVE) */
});