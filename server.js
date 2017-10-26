var express		= 	require("express");
var session		=	require("express-session");
var bodyParser 	= 	require("body-parser");
var mysql 		= 	require("mysql");
var path 		= 	require("path");
var database 	=	require("./database_handler");
var sess_info 	=	require("./sess_info")
var app 		= 	express();

app.use(express.static(__dirname + "/views/pages", {extensions: ['html']}));

// views is directory for all template files
//app.set('views', webDir);
app.set('views', __dirname + "/views");
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


//support json-encoded body of request for POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); 

//app.use('trust proxy', 1); // trust first proxy
//initialize session
app.use(session({
	secret				: sess_info.secret,
	resave				: sess_info.resave,
	saveUninitialized	: sess_info.saveUninitialized,
	cookie				: sess_info.cookie
}));

// ~~~~ REQUEST HANDLER FOR MAIN ~~~~ (BELOW) //

var server_main		=	require("./server_main");

app.get("/", function(req, res) {
	server_main.slash(req, res);
});

app.post("/email-login", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");

	server_main.emailLogin(req, res);
});

// ~~~~ REQUEST HANDLER FOR MAIN ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR NAVBAR ~~~~ (BELOW) //

app.get("/logout", function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/");
		}
	});
});

  //show user's menus (msg, alarm, profile..etc) iff user is logged in
app.get("/check-user-login", function(req, res) {
    var jsonToSend = [];
    var tempSess = req.session;
    //define content-type to avoid XHL parsing error in FireFox
    res.setHeader("Content-Type", "application/json");
    jsonToSend.push(tempSess);
    //send session in JSON form
	res.end(JSON.stringify(jsonToSend));
});

// ~~~~ REQUEST HANDLER FOR NAVBAR ~~~~ (ABOVE) //


// ~~~~ REQUEST HANDLER FOR REGISTRATION ~~~~ (BELOW) //

var server_register		=	require("./server_register");

  //redirect to registration page
app.get("/register", function(req, res) {
	res.render("pages/registration.html");
});

  //registration process handler
app.post("/submit-register-form", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");

    //call verify email first (next step's fcn is nested inside of this fcn.)
	server_register.register(req, res);
});

// ~~~~ REQUEST HANDLER FOR REGISTRATION ~~~~ (ABOVE) //


// ~~~~ REQUEST HANDLER FOR MY PAGE ~~~~ (BELOW) //

app.get("/mypage", function(req, res) {
	res.render("pages/blog_mypage.html");
});

// ~~~~ REQUEST HANDLER FOR MY PAGE ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR ACCOUNT INFO ~~~~ (BELOW) //

app.get("/account-info", function(req, res) {
	res.render("pages/account_info.html");
});

app.get("/acc-profile", function(req, res) {

});

app.get("/acc-friends", function(req, res) {

});

app.get("/acc-categories", function(req, res) {

});

app.get("/acc-management", function(req, res) {

});

app.get("/acc-modify-pass", function(req, res) {

});

app.get("/acc-delete-account", function(req, res) {
	
});


// ~~~~ REQUEST HANDLER FOR ACCOUNT INFO ~~~~ (ABOVE) //


// open localhost server at port 3100.
app.listen(3100);