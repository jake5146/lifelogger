//AJAX request handler function for main.html page
var path 		= 	require("path");
var bcrypt		=	require("bcrypt");
var database 	=	require("./database_handler");

var sess;

//app.get('/')
function slashGet(req, res) {
	sess = req.session;
	if (sess.email) {
		res.redirect("/mypage")
	} else {
		res.render("pages/main.html");
	}
}

//app.post('/email-login')
function emailLoginPost(req, res) {
	// firstly, retrieve data from database using email and match password using bcrypt later.
	var query = "SELECT * FROM Users_test WHERE email = ?";
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
function emailLoginPostHandler(err, rows, req, res, callback) {
	var resultJson = [];
	var jsonObj = {};

    //if query causes error, send error msg.
	if (err) {
		jsonObj.msg = err;
		resultJson.push(jsonObj);
		res.end(JSON.stringify(resultJson));
	} else {
		// rows has no row when given login infos are wrong
		if (rows.length !== 1) {
			jsonObj.loginCode = 0; //login fails
			resultJson.push(jsonObj);
			res.end(JSON.stringify(resultJson));
	    // rows has 1 row -> email matched
		} else {
			//compare hashed password and given password using bcrypt
			bcrypt.compare(req.body[0].password, rows[0].password, function(err, response) {
				//if bcrypt causes error, send error msg.
				if (err) {
					jsonObj.msg = err;
                //password matched -> login success
				} else if (response) {
					sess = req.session;
					sess.email = req.body[0].email;
					jsonObj.loginCode = 1; //login succeeds
				//password mismatched -> login fails
				} else {
					jsonObj.loginCode = 0; //login fails
				}
				resultJson.push(jsonObj);
				res.end(JSON.stringify(resultJson));
			});
		}
	}
}



module.exports = {
	slash: slashGet,
	emailLogin: emailLoginPost
}