//AJAX request handler function for add_post.html page
var database 	=	require("./database_handler");

function postAddPost(req, res) {
	if (req.session.email) {
		var info = req.body;

		//if selected category is 'All' category
		var query = "INSERT INTO Posts (title, uid, contents, temporary)" + 
					 " SELECT ?, uid, ?, ? FROM Users WHERE email=?";
		var vals = [info.title, info.contents, info.temporary, req.session.email];

		//if selected category is parent category.
		if (info.pcid) {
			query = "INSERT INTO Posts (title, pcid, uid, contents, temporary)" + 
					 " SELECT ?, ?, uid, ?, ? FROM Users WHERE email=?";
			vals = [info.title, info.pcid, info.contents, info.temporary, req.session.email];
		} 

		//if selected category is child category. 
		if (info.ccid) {
			query = "INSERT INTO Posts (title, pcid, ccid, uid, contents, temporary)" + 
					 " SELECT ?, ?, ?, uid, ?, ? FROM Users WHERE email=?";
		    vals = [info.title, info.pcid, info.ccid, info.contents, info.temporary, req.session.email];
		}

	    database.query(req, res, query, vals, postAddPostHandler);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function postAddPostHandler(rows, req, res) {
	var jsonL = {success: 1};
	res.end(JSON.stringify(jsonL));
}

module.exports = {
	addpost: postAddPost
}