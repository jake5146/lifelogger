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
	var sess = req.session;
	var uniqueUrl = "/blog/" + 
        				sess.first_name.toLowerCase().replace(/\s+/, "") + 
        				"-" + sess.uid;
    res.end(JSON.stringify({url: uniqueUrl}));
}

function loadPostOnEdit(req, res) {
	if (req.session.uid) {
		var query = "SELECT * FROM Posts WHERE uid=? AND postid=?";
		var val = [req.session.uid, req.body.postid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function editPost(req, res) {
	if (req.session.uid) {
		var info = req.body;

		var query = "UPDATE Posts SET title=?, contents=? WHERE uid=? AND postid=?";
		var vals = [info.title, info.contents, req.session.uid, info.postid];

		if (info.pcid) {
			query = "UPDATE Posts SET title=?, pcid=?, ccid=?, contents=? WHERE uid=? AND postid=?";
			var ccid = (info.ccid) ? info.ccid: null;
			vals = [info.title, info.pcid, ccid, info.contents, req.session.uid, info.postid];
		}

	    database.query(req, res, query, vals, postAddPostHandler);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

/* ***** Common Functions (BELOW) ***** */

function ajaxSimpleGetCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify(rows));
}

/* ***** Common Functions (ABOVE) ***** */

module.exports = {
	addpost: 	postAddPost,
	loadPost: 	loadPostOnEdit,
	editPost: 	editPost
}