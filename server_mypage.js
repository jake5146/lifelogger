var database 	=	require("./database_handler");

// AJAX POST handler for app.post("/post-info"... 
// (get pcid, ccid, start offset info to send corresponding data)
function getPostInfo(req, res) {
	if (req.session.email) {
		var info = req.body;
		var ccidQuery = (info.ccid) ? "ccid=" + info.ccid + " AND ": "";
		var pcidQuery = (info.pcid) ? "pcid=" + info.pcid + " AND ": "";
		var query = "SELECT postid, title, pcid, ccid, contents, " + 
					"likes, time_post, last_edit " + 
					"FROM Posts " + 
					"WHERE temporary=0 AND " + pcidQuery + ccidQuery +
						  "uid=(SELECT uid FROM Users WHERE email=?) " +
					"ORDER BY postid LIMIT " + info.startOffset + ",50";

		var val = [req.session.email];
		database.query(req, res, query, val, getPostHandler);

	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function getPostHandler(rows, req, res) {
	console.log(rows);
	res.end(JSON.stringify(rows));
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
					"uid=(SELECT uid FROM Users WHERE email=?)";
		var val = [req.session.email];
		database.query(req, res, query, val, getPostHandler);

	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* AJAX GET handler for getting number of likes of user */
function getBlogLikes(req, res) {
	if (req.session.email) {
		var query = "SELECT COUNT(*) AS likes FROM WhoLikedBlogs " +
					"WHERE uidLiked=(SELECT uid FROM Users WHERE email=?)";
	    var val = [req.session.email];
	    database.query(req, res, query, val, getPostHandler);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}




module.exports = {
	getPost: 	  getPostInfo,
	getPostCount: getPostCount,
	getBlogLikes: getBlogLikes
}