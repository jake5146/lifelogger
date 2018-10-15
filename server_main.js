//AJAX request handler function for main.html page
var path 		= 	require("path");
var bcrypt		=	require("bcrypt-nodejs");
var database 	=	require("./database_handler");

var sess;

//app.get('/')
function slashGet(req, res) {
	sess = req.session;
	if (sess.email) {
		// res.redirect("/mypage")
        var uniqueUrl = "/blog/" + 
        				sess.first_name.toLowerCase().replace(/\s+/, "") + 
        				"-" + sess.uid;
        res.redirect(uniqueUrl);
	} else {
		res.render("pages/main.html");
	}
}

//app.post('/email-login')
function emailLoginPost(req, res) {
	// firstly, retrieve data from database using email and match password using bcrypt later.
	var query = "SELECT * FROM Users WHERE email = ?";
	var queryVals = [req.body[0].email];
	database.query(req, res, query, queryVals, emailLoginPostHandler, function(){});
}

// login feature POST request handler (queryFcn)
// @param err: error will be indicated in here (error from query fcn)
// @param rows: result of SQL query.
// @param req: requested data, req.body refers to data input from client-side
// @param res: data to be responded to client. It must be modified to return
//             wanting values.
// @param callback: callback function used for another action. It won't be used
//                  in this request.
function emailLoginPostHandler(rows, req, res, callback) {
	var jsonObj = {};

	// rows has no row when given login infos are wrong
	if (rows.length !== 1) {
		jsonObj.loginCode = 0; //login fails
		res.end(JSON.stringify(jsonObj));
    // rows has 1 row -> email matched
	} else {
		//@@@@@@@@@@@@@@TEMPORARY CODE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		// if (req.body[0].password === rows[0].password) {
		// 	sess = req.session;
		// 	sess.email = req.body[0].email;
		// 	sess.uid = rows[0].uid;
		// 	sess.first_name = rows[0].first_name;
		// 	jsonObj.loginCode = 1;
		// 	jsonObj.first_name = rows[0].first_name.toLowerCase().replace(/\s+/, "");;
		// 	jsonObj.uid = rows[0].uid;
		// 	res.end(JSON.stringify(jsonObj));
		// } else {
		// 	bcrypt.compare(req.body[0].password, rows[0].password, function(bErr, response) {
		// 		//if bcrypt causes error, send error msg.
		// 		if (bErr) {
		// 			jsonObj.msg = bErr;
	 //            //password matched -> login success
		// 		} else if (response) {
		// 			sess = req.session;
		// 			sess.email = req.body[0].email;
		// 			sess.uid = rows[0].uid;
		// 			sess.first_name = rows[0].first_name;
		// 			jsonObj.loginCode = 1; //login succeeds
		// 			jsonObj.first_name = req.body[0].first_name;
		// 			jsonObj.uid = req.body[0].uid;
		// 		//password mismatched -> login fails
		// 		} else {
		// 			jsonObj.loginCode = 0; //login fails
		// 		}
		// 		res.end(JSON.stringify(jsonObj));
		// 	});
		// }
		//@@@@@@@@@@@@@@TEMPORARY CODE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		bcrypt.compare(req.body[0].password, rows[0].password, function(bErr, response) {
			//if bcrypt causes error, send error msg.
			if (bErr) {
				jsonObj.msg = bErr;
            //password matched -> login success
			} else if (response) {
				sess = req.session;
				sess.email = req.body[0].email;
				sess.uid = rows[0].uid;
				sess.first_name = rows[0].first_name;
				jsonObj.loginCode = 1; //login succeeds
				jsonObj.first_name = req.body[0].first_name;
				jsonObj.uid = req.body[0].uid;
			//password mismatched -> login fails
			} else {
				jsonObj.loginCode = 0; //login fails
			}
			res.end(JSON.stringify(jsonObj));
		});


		//~~~~~~~~~~~~~~~~~ORIGNAL CODE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
		//compare hashed password and given password using bcrypt
		// bcrypt.compare(req.body[0].password, rows[0].password, function(bErr, response) {
		// 	//if bcrypt causes error, send error msg.
		// 	if (bErr) {
		// 		jsonObj.msg = bErr;
  //           //password matched -> login success
		// 	} else if (response) {
		// 		sess = req.session;
		// 		sess.email = req.body[0].email;
		// 		sess.uid = rows[0].uid;
		// 		sess.first_name = rows[0].first_name.toLowerCase().replace(/\s+/, "");;
		// 		jsonObj.loginCode = 1; //login succeeds
		// 		jsonObj.first_name = sess.first_name;
		// 		jsonObj.uid = sess.uid;
		// 	//password mismatched -> login fails
		// 	} else {
		// 		jsonObj.loginCode = 0; //login fails
		// 	}
		// 	res.end(JSON.stringify(jsonObj));
		// });
		//~~~~~~~~~~~~~~~~~ORIGNAL CODE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
	}
}



module.exports = {
	slash: slashGet,
	emailLogin: emailLoginPost
}