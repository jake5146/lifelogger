var database 	=	require("./database_handler");

// app.get("/acc-personal"... handler 
// get information for profile
function getPersonalInfo(req, res, uid) {
	var query = "SELECT * FROM Users WHERE uid = ?";
	var queryVal = [uid];
	database.query(req, res, query, queryVal, getPersonalInfoHandler, function(){});
}

// Handle app.get("/acc-profile"... after querying database.
function getPersonalInfoHandler(rows, req, res, callback) {
	var jObj = {};
	if (rows.length <= 0) {
		jObj.invalid = 1;
	} else {
		jObj = rows[0];
		jObj.isMyBlog = (jObj.uid === req.session.uid) ? 1: 0;
		delete jObj.password;
		delete jObj.uid;		
	}
	res.end(JSON.stringify(jObj));
}

function getMyInfo(req, res) {
	if (req.session.uid) {
		var query = "SELECT * FROM Users WHERE uid=?";
		var val = [req.session.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}


// AJAX POST handler for app.post("/post-info"... 
// (get pcid, ccid, start offset info to send corresponding data)
function getPostInfo(req, res) {
	if (req.session.email) {
		var info = req.body;
		var ccidQuery = (info.ccid) ? "ccid=" + info.ccid + " AND ": "";
		var pcidQuery = (info.pcid) ? "pcid=" + info.pcid + " AND ": "";
		var query = "SELECT postid, title, pcid, ccid, contents, " + 
					"likes, last_edit " + 
					"FROM Posts " + 
					"WHERE temporary=0 AND " + pcidQuery + ccidQuery +
						  "uid=? " +
					"ORDER BY postid DESC LIMIT " + info.startOffset + ",50";

		var val = [info.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);

	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

//AJAX GET Handler for app.get(/\/post\/uid-(\d+)\/postid-(\d+)/, ...)
function getSinglePostInfo(req, res, uid, postid) {
	if (req.session.uid) {
		var query = "SELECT title, contents, likes, last_edit " +
					"FROM Posts WHERE uid=? AND postid=?";
		var val = [uid, postid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	}
}

/* AJAX POST handler for getting count of posts when 
 * pcid and ccid is met. */
function getPostCount(req, res) {
	if (req.session.email) {
		var info = req.body;
		var ccidQuery = (info.ccid) ? "ccid=" + info.ccid + " AND ": "";
		var pcidQuery = (info.pcid) ? "pcid=" + info.pcid + " AND ": "";
		var query = "SELECT COUNT(*) AS count FROM Posts " + 
					"WHERE temporary=0 AND " + pcidQuery + ccidQuery + 
					"uid=?";
		var val = [info.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);

	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* AJAX POST handler for getting number of likes of user */
function getBlogLikes(req, res) {
	if (req.session.uid) {
		var query = "SELECT COUNT(*) AS likes FROM WhoLikedBlogs " +
					"WHERE uidLiked=?";
	    var val = [req.body.pageUid];
	    database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* AJAX POST handler for increasing number of likes of user */
function postLikeBlog(req, res) {
	if (req.session.uid) {
		var query = "SELECT * FROM WhoLikedBlogs " + 
					"WHERE uid=? AND uidLiked=?";
		var val = [req.session.uid, req.body.pageUid];
		database.query(req, res, query, val, postLikeBlogUpdate);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* Update number of likes of user */
function postLikeBlogUpdate(rows, req, res) {
	console.log("------------");
	var query;
	var val = [req.session.uid, req.body.pageUid];
	console.log(val);
	if (rows.length > 0) {
		query = "DELETE FROM WhoLikedBlogs WHERE uid=? AND uidLiked=?";
	} else {
		query = "INSERT INTO WhoLikedBlogs VALUES ('?', '?')";
	}
	console.log(query);
	database.query(req, res, query, val, ajaxSimplePostCbFcn);
}

/* AJAX POST handler for checking if user and page owner is friends */
function postAreWeFriends(req, res) {
	if (req.session.email) {
		var query = "SELECT * FROM Friends " + 
					"WHERE (friendOne=? AND friendTwo=?) " + 
					   "OR (friendOne=? AND friendTwo=?);";
		var val = [req.session.uid, req.body.uid, req.body.uid, req.session.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* AJAX POST handler for adding/removing/accepting friend relationship (request)*/
function postFriendRequest(req, res) {
	var reqCode = req.body.reqCode;
	var query;
	var val;
	if (reqCode === "unfriend" || reqCode === "cancel-request" 
		|| reqCode === "decline-request") {
		query = "DELETE FROM Friends " + 
					"WHERE (friendOne=? AND friendTwo=?) " +
					   "OR (friendOne=? AND friendTwo=?)";
		val = [req.session.uid, req.body.uid, req.body.uid, req.session.uid];
	} else if (reqCode === "request-friend" || "accept-request") {
		query = "INSERT INTO Friends VALUES (?, ?)";
		val = [req.session.uid, req.body.uid];
	}
	database.query(req, res, query, val, postFriendRequestHandler);
}

function postFriendRequestHandler(rows, req, res) {
	res.end(JSON.stringify({"reqCode": req.body.reqCode}));
}



/* ***** Common Functions (BELOW) ***** */
function ajaxSimplePostCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify({success: 1}));
}

function ajaxSimpleGetCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify(rows));
}

/* ***** Common Functions (ABOVE) ***** */



module.exports = {
	getPersonal:   		getPersonalInfo,
	getMyInfo: 			getMyInfo,
	getPost: 	  		getPostInfo,
	getSinglePost: 		getSinglePostInfo,
	getPostCount: 		getPostCount,
	getBlogLikes: 		getBlogLikes,
	postLikeBlog: 		postLikeBlog,
	postAreWeFriends: 	postAreWeFriends,
	postFriendRequest: 	postFriendRequest
}