var database 	=	require("./database_handler");

/* ***** Profile Info - AJAX request handler (BELOW) ***** */

// app.get("/acc-profile"... handler 
// get information for profile
function getProfileInfo(req, res) {
	var query = "SELECT * FROM Users WHERE email = ?";
	var queryVal = [req.session.email];
	database.query(req, res, query, queryVal, getProfileInfoHandler, function(){});
}

// Handle app.get("/acc-profile"... after querying database.
function getProfileInfoHandler(rows, req, res, callback) {
	var jObj = {};
	if (rows.length <= 0) {
		jObj.invalid = 1;
	} else {
		jObj = rows[0];
		delete jObj.password;
		delete jObj.uid;
	}
	res.end(JSON.stringify(jObj));
}

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
					      			 "WHERE uid=(SELECT uid FROM Users WHERE email=?)) AS cc " + 
					      "ON pc.pcid=cc.pcid) AS category " + 
			    "WHERE uid=(SELECT uid FROM Users WHERE email=?);"
	var queryVal = [req.session.email, req.session.email];
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
function postEdittedCatnames(req, res) {
	var info = req.body;
	var queries = [];
	queries.push(constructUpdateCatQuery(true, info.pcid));
	queries.push(constructUpdateCatQuery(false, info.ccid));

	database.multiquery(req, res, queries, [[], []], postEdittedCatnamesHandler);
}

function constructUpdateCatQuery(isParent, cids) {
	var keys = Object.keys(cids);
	var tableName = (isParent) ? "ParentCategory": "ChildCategory";
	var cidType = (isParent) ? "pcid": "ccid"; 
	var cidName = (isParent) ? "pname": "cname";
	var query = "UPDATE " + tableName + " SET " + cidName + " = (case";

	var i;
	for (i = 0; i < keys.length; i++) {
		var eachCase = " when " + cidType + " = " + keys[i] + 
					   " then '" + cids[keys[i]] + "'";
		query += eachCase;
	}
	query += " end) WHERE " + cidType + " in (" + keys.toString() + ")";

	return query;
}

function postEdittedCatnamesHandler(rows, req, res, callback) {
	var json = {success: 1};
	res.end(JSON.stringify(json));
}


/* ***** Categories Section - AJAX request handler (ABOVE) ***** */

module.exports = {
	getProfile: 			getProfileInfo,
	postEdittedProfile: 	postEdittedProfile,
	getCategory: 			getCategoryInfo, 
	postEdittedCatnames: 	postEdittedCatnames
}