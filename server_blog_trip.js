var database 	=	require("./database_handler");

/* AJAX GET Handler for app.post("/blog-trip-info", ...) */
function getBlogTripInfo(req, res) {
	if (req.session.uid) {
		var query = "SELECT u.uid, u.first_name, u.blog_title, u.header_bg," + 
						  " u.about, u.nick_name, u.profile, wlb.count " + 
				    "FROM Users AS u LEFT JOIN " + 
				    	  "(SELECT uidLiked, COUNT(uidLiked) AS count " + 
				    	   "FROM WhoLikedBlogs GROUP BY uidLiked) AS wlb " + 
				    "ON u.uid=wlb.uidLiked " + 
				    "WHERE u.nick_name LIKE '%" + req.body.keyword + "%' " + 
				    	  "ORDER BY wlb.count DESC LIMIT " + req.body.offset +",10";
		database.query(req, res, query, [], ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
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
	getBlogTripInfo: 	getBlogTripInfo
}