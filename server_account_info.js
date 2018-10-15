var database 		=	require("./database_handler");
var server_register = 	require("./server_register");
var bcrypt			=	require("bcrypt-nodejs");

/* ***** Profile Info - AJAX request handler (BELOW) ***** */

// app.get("/acc-profile"... handler 
// get information for profile
// function getProfileInfo(req, res) {
// 	var query = "SELECT * FROM Users WHERE email = ?";
// 	var queryVal = [req.session.email];
// 	database.query(req, res, query, queryVal, getProfileInfoHandler, function(){});
// }

// // Handle app.get("/acc-profile"... after querying database.
// function getProfileInfoHandler(rows, req, res, callback) {
// 	var jObj = {};
// 	if (rows.length <= 0) {
// 		jObj.invalid = 1;
// 	} else {
// 		jObj = rows[0];
// 		delete jObj.password;
// 		delete jObj.uid;
// 	}
// 	res.end(JSON.stringify(jObj));
// }

// app.post("/submit-profile-edit"
// edit information from database
function postEdittedProfile(req, res) {
	var query;
	var queryVal;
	var info = req.body;
	if (req.file) {
		query = "UPDATE Users SET birthday = ?, phone_number = ?, about = ?" + 
	            ", profile = ? WHERE email = ?";
        queryVal = [info.birthday, info.phone, info.about, 
	                req.file.filename, req.session.email];
	} else {
		query = "UPDATE Users SET birthday = ?, phone_number = ?, about = ?" + 
	            " WHERE email = ?";
        queryVal = [info.birthday, info.phone, info.about, req.session.email];
	}
	database.query(req, res, query, queryVal, postEdittedProfileHandler, function(){});
}

// Handle app.post("/submit-profile-edit"... after querying database.
function postEdittedProfileHandler(rows, req, res, callback) {
	var jsonObj = {};
	jsonObj.success = 1; // Post Succeeded
	res.end(JSON.stringify(jsonObj));
}

/* ***** Profile Info - AJAX request handler (ABOVE) ***** */

/* ***** Categories Section - AJAX request handler (BELOW) ***** */

// Handle app.get("/acc-categories",...). Extract categories info from database
// and send it to client-side to display it correctly.
function getCategoryInfo(req, res) {
	/* This is a nested SQL query, and the description is following:
	 * 1) Get uid using email in session
	 * 2) Using uid to get ccid and cnames with pcids as references.
	 * 3) Get JOIN with ParentCategory
	 * 4) Filter with uid again to get only corresponding uid's categories.
	 * Then forward the result to client. */
	var query = "SELECT pcid, pname, ccid, cname " + 
				"FROM (SELECT pc.uid, pc.pcid, pc.pname, cc.ccid, cc.cname " + 
					  "FROM ParentCategory AS pc " + 
					      "LEFT JOIN (SELECT ccid, cname, pcid " + 
					      			 "FROM ChildCategory " +
					      			 "WHERE uid=?) AS cc " + 
					      "ON pc.pcid=cc.pcid) AS category " + 
			    "WHERE uid=?";
	var uid = req.body.uid;
	if (!uid) uid = req.session.uid; 
	var queryVal = [uid, uid];
	database.query(req, res, query, queryVal, getCategoryInfoHandler, function(){});
}

// Send category info to client side.
function getCategoryInfoHandler(rows, req, res, callback) {
	console.log(rows);
	var jsonL = rows;
	res.end(JSON.stringify(jsonL));
}

// Handle app.post("/submit-category-edit", ...). Update user-editted category's names
//  in database.
function postEdittedCat(req, res) {
	var addInfo = req.body[0];
	var delInfo = req.body[1];
	var modInfo = req.body[2];

	// console.log("addInfo:");
	// console.log(addInfo);
	// console.log("delInfo:");
	// console.log(delInfo);
	// console.log("modInfo:");
	// console.log(modInfo);

	var queries = [];
	var uid = req.session.uid;

	// Query: adding category
	if (Object.keys(addInfo.pcid).length) 
		queries = queries.concat(constructCatQuery(true, addInfo.pcid, uid, "insert"));
	if (Object.keys(addInfo.ccid).length) 
		queries = queries.concat(constructCatQuery(false, addInfo.ccid, uid, "insert"));

	// Query: modifying category's name
	if (Object.keys(modInfo.pcid).length) 
		queries = queries.concat(constructCatQuery(true, modInfo.pcid, uid, "update"));
	if (Object.keys(modInfo.ccid).length) 
		queries = queries.concat(constructCatQuery(false, modInfo.ccid, uid, "update"));

	// Query: deleting category
	if (Object.keys(delInfo.pcid).length) 
		queries = queries.concat(constructCatQuery(true, delInfo.pcid, uid, "delete"));
	if (Object.keys(delInfo.ccid).length) 
		queries = queries.concat(constructCatQuery(false, delInfo.ccid, uid, "delete"));

	console.log("queries:");
	console.log(queries);
	// execute queries
	if (queries.length) database.multiquery(req, res, queries, [[], []], postEdittedCatHandler);
	else postEdittedCatHandler([], req, res);
}

function constructCatQuery(isParent, cids, uid, type) {
	var keys = Object.keys(cids);
	var tableName = (isParent) ? "ParentCategory": "ChildCategory";
	var cidType = (isParent) ? "pcid": "ccid"; 
	var cidName = (isParent) ? "pname": "cname";

	console.log(type);
	if (type === "update") {
		var query = "UPDATE " + tableName + " SET " + cidName + " = (case";
		var i;
		for (i = 0; i < keys.length; i++) {
			query += " when " + cidType + " = " + keys[i] + 
					   " then '" + cids[keys[i]][0] + "'";
		}
		query += " end) WHERE " + cidType + " in (" + keys.toString() + ")" +
		                      "AND uid=" + uid;

		console.log(query);
		return [query];
	} else if (type === "insert") {
		var query = "INSERT INTO " + tableName + " VALUES ";
		var i;
		for (i = 0; i < keys.length; i++) {
			var ifchild = (isParent) ? "": ("," + cids[keys[i]][1]);
			query += "(" + uid + "," + keys[i] + ",'" + cids[keys[i]][0] + "'" + 
					 ifchild + "),";
		}
		query = query.substring(0, query.length - 1);
		console.log(query);
		return [query];
	} else if (type === "delete") { 
		//delete all rows from ParentCategory/ChildCategory and Posts
		var allCids = "(";
		var i;
		for (i = 0; i < keys.length; i++) {
			allCids += " " + cidType + "=" + keys[i] + " OR";
		} 
		allCids = allCids.substring(0, allCids.length - 2);
		allCids += ")";

		var queries = [];
		var mainQuery = "DELETE FROM " + tableName + " WHERE uid=" + uid +
					" AND " + allCids;
		queries.push(mainQuery);

		if (isParent) {
			var delChildQuery = "DELETE FROM ChildCategory WHERE uid=" + uid + 
								" AND " + allCids;
			queries.push(delChildQuery);
		}

		var delPostQuery = "DELETE FROM Posts WHERE uid=" + uid + 
						   " AND " + allCids; 
		queries.push(delPostQuery);
		console.log(queries);
		return queries;
	}
}

function postEdittedCatHandler(rows, req, res, callback) {
	var json = {success: 1};
	res.end(JSON.stringify(json));
}

/* AJAX GET handler for app.get("/acc-friends", ...) */
function getFriendsInfo(req, res) {
	if (req.session.email) {
		var query = "SELECT u.uid, u.nick_name, u.first_name, u.profile " +
					"FROM Users AS u JOIN " +
					    "(SELECT f2.friendOne, f2.friendTwo " +
					    "FROM Friends AS f1 JOIN " + 
					    "(SELECT * FROM Friends WHERE friendOne=?) AS f2 " + 
					    "ON f1.friendOne=f2.friendTwo AND f1.friendTwo=f2.friendOne) AS f " + 
					"ON u.uid=f.friendTwo WHERE u.nick_name LIKE '%" + 
					req.body.keyword + "%' ORDER BY u.nick_name LIMIT ?,?";
		database.query(req, res, query, [req.session.uid, req.body.offset, req.body.offset + 5], 
						ajaxSimpleGetCbFcn);
	}
}


/* ***** Categories Section - AJAX request handler (ABOVE) ***** */

/* ***** Management Section - AJAX request handler (BELOW) ***** */

function postSubmitManageEdit(req, res) {
	var query;
	var queryVal;
	var info = req.body;
	if (req.file) {
		query = "UPDATE Users SET blog_title = ?, header_color = ?, header_bg = ?, " + 
				"footer_sent = ? WHERE email = ?";
        queryVal = [info.blog_title, info.header_color, req.file.filename, 
        			info.footer_sent, req.session.email];
	} else {
		query = "UPDATE Users SET blog_title = ?, header_color = ?, " + 
				"footer_sent = ? WHERE email = ?";
        queryVal = [info.blog_title, info.header_color, 
        			info.footer_sent, req.session.email];
	}
	database.query(req, res, query, queryVal, ajaxSimplePostCbFcn, function(){});
}

/* ***** Management Section - AJAX request handler (ABOVE) ***** */

/* ***** Modify Password & Delete Account Section - AJAX request handler (BELOW) ***** */

// variables that contain contents for verification email 
// (contents change depending on which request user sends)
var subj;
var comments;


/* AJAX POST handler for app.post("/submit-modify-pass", ...) */
function postModifyPass(req, res) {
	if (req.session.uid) {
		if (req.body.email === rows[0].email) {
			var query = "SELECT email, password FROM Users WHERE uid=?";
			subj = "Hi, " + req.body.nick_name + ". Here is your " +
				   "verification code for modifying password. | A Lifelogger";
			comments = {
		    	comment_1: "You requested to change password in A Lifelogger Official Website.",
		    	comment_2: "Please type code above to finish the process."
		    }
			database.query(req, res, query, [req.session.uid], sendVerifCodeHandler);		
		} else {
			res.end(JSON.stringify({wrong: 1}));
		}
	}
}

/* AJAX POST handler for app.post("/request-del-acc", ...) */
function postReqDelAcc(req, res) {
	if (req.session.uid) {
		var query = "SELECT email, password FROM Users WHERE uid=?";
		subj = "Hi, " + req.body.nick_name + ". Here is your " +
			   "verification code for deleting account. | A Lifelogger";
		comments = {
	    	comment_1: "You requested to delete account in A Lifelogger Official Website.",
	    	comment_2: "We are sorry to hear that you want to quit A Lifelogger."
	    }
		database.query(req, res, query, [req.session.uid], sendVerifCodeHandler);	
	}
}

function sendVerifCodeHandler(rows, req, res) {
	// @@TODO:: compare password by bcrypt
	// if wrong, send wrong: 1, if right, then send verification email by server_register.verifyCode
	bcrypt.compare(req.body.old_password, rows[0].password, function(bErr, response) {
		//if bcrypt causes error, send error msg.
		var jsonObj = {};
		if (bErr) {
			res.end(JSON.stringify({msg: bErr}));
	    //password matched -> login success
		} else if (response) {
			if (req.body.email === rows[0].email) {
				server_register.verifyCode(req, res, req.body, subj, comments);
			} else {
				res.end(JSON.stringify({wrong: 1}));
			}
		} else {
			res.end(JSON.stringify({wrong: 1}));
		}
	});
}

/* AJAX POST handler for app.post("/update-password", ...) */
function postUpdatePassword(req, res) {
	if (req.session.uid) {
		var query = "UPDATE Users SET password=? WHERE uid=?";
		database.query(req, res, query, [req.body.password, req.session.uid], ajaxSimplePostCbFcn);
	}
} 

/* AJAX POST handler for app.get("/delete-account", ...) */
function getDelAcc(req, res) {
	if (req.session.uid) {
		//delete user's info from all tables
		var queries = [];
		var where = "WHERE uid=" + req.session.uid;
		queries.push("DELETE FROM Posts " + where);
		queries.push("DELETE FROM ChildCategory " + where);
		queries.push("DELETE FROM ParentCategory " + where);
		queries.push("DELETE FROM Friends WHERE friendOne=" + req.session.uid +
											" OR friendTwo=" + req.session.uid);
		queries.push("DELETE FROM WhoLikedBlogs " + where +
												" OR uidLiked="+ req.session.uid);
		queries.push("DELETE FROM Users " + where);

		//@@TODO::: Add More DELETE query in the future

		database.multiquery(req, res, queries, [[], []], getDelAccHandler);
	}
}

/* Handler for postDelAcc */
function getDelAccHandler(rows, req, res) {
	res.redirect("/verif-code-destroy");
}

/* ***** Modify Password & Delete Account Section - AJAX request handler (ABOVE) ***** */


/* ***** Common Functions (BELOW) ***** */
function ajaxSimplePostCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify({success: 1}));
}

function ajaxSimpleGetCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify(rows));
}

/* ***** Common Functions (ABOVE) ***** */


module.exports = {
	// getProfile: 			getProfileInfo,
	postEdittedProfile: 	postEdittedProfile,
	getCategory: 			getCategoryInfo, 
	postEdittedCat: 		postEdittedCat,
	getFriends:  			getFriendsInfo,
	postSubmitManageEdit: 	postSubmitManageEdit,
	postModifyPass: 		postModifyPass,
	postUpdatePassword: 	postUpdatePassword,
	postReqDelAcc: 			postReqDelAcc,
	getDelAcc: 				getDelAcc
}