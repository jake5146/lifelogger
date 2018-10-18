var express		= 	require("express");
var session		=	require("express-session");
var multer		=	require("multer");
var bodyParser 	= 	require("body-parser");
var mysql 		= 	require("mysql");
var path 		= 	require("path");
var crypto		=	require("crypto");
var database 	=	require("./database_handler");
var sess_info 	=	require("./sess_info");


var app 		= 	express();

var server 		= 	require("http").Server(app);
var PORT = process.env.PORT || 3100;
server.listen(PORT);
var io 			= 	require("socket.io")(server);

var storage 	= 	multer.diskStorage({
	destination: "./views/pages/uploads/",
	filename: function(req, file, callback) {
		crypto.pseudoRandomBytes(16, function(err, raw) {
			if (err) {
				return callback(err);
			} else {
				callback(null, raw.toString("hex") + Date.now() +
				          path.extname(file.originalname));
			}
		});
	}
});
var upload		=	multer({ storage: storage });

app.use(express.static(__dirname + "/views/pages", {extensions: ['html', 'json']}));

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

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	// res.setHeader("Content-Type", "application/json");
	next();
});

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
    sendSession(req, res);
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
	server_register.verify(req, res);
});

app.get("/verification", function(req, res) {
	//res.render("pages/verification_sent.html");
	//sendSession(req, res);
    res.render("pages/verification_sent.html");
});

app.get("/verify-code", function(req, res) {
	console.log("--inside of render(verification_sent)--");
    var tempSess = req.session;
    //define content-type to avoid XHL parsing error in FireFox
    res.setHeader("Content-Type", "application/json");
    //send session in JSON form
    res.end(JSON.stringify(tempSess));
});

app.post("/verif-code-submit", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_register.register(req, res);
});

app.get("/verif-code-destroy", function(req, res) {
	req.session.destroy(function(err) {
		var jsonObj = {};
		if (err) {
			console.log(err);
			jsonObj.msg = err;
		} else {
			jsonObj.destroyed = 1;
		}
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(jsonObj));
	});
});

// ~~~~ REQUEST HANDLER FOR REGISTRATION ~~~~ (ABOVE) //

 
// ~~~~ REQUEST HANDLER FOR MY PAGE ~~~~ (BELOW) //

var server_mypage	=	require("./server_mypage");

app.get(/\/blog\/(\w+)-(\d+)/, function(req, res) {
	console.log(req.url);
	console.log(req.url.match(/\/post-(\d+)/));
	if (req.url.match(/\/post-(\d+)/)) {
		res.render("pages/post.html");
		console.log("add post!!");
	} else {
		res.render("pages/blog_mypage.html");
	}
});

app.get(/\/profile\/(\w+)-(\d+)/, function(req, res) {
	console.log(req.url);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	var uid = req.url.match(/\/profile\/(\w+)-(\d+)/)[2];
	//var uid = parseUrl(req.url, 1)[1];
	server_mypage.getPersonal(req, res, uid);
});

app.get(/\/write-post/, function(req, res) {
	if (req.session.email) {
		res.render("pages/add_post.html");
	} else {
		res.redirect("/");
	}
});

app.post("/post-info", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getPost(req, res);
});

app.post("/post-count", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getPostCount(req, res);
});

app.post("/get-likes", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getBlogLikes(req, res);
});

app.post("/are-we-friends", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.postAreWeFriends(req, res);
});

app.post("/friend-request", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.postFriendRequest(req, res);
});

app.get(/\/post\/uid-(\d+)\/postid-(\d+)/, function(req, res) {
	var infos  = req.url.match(/\/post\/uid-(\d+)\/postid-(\d+)/),
		uid    = infos[1],
		postid = infos[2];
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getSinglePost(req, res, uid, postid);
});

app.post("/like-blog", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.postLikeBlog(req, res);
});

app.get("/get-my-info", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getMyInfo(req, res);
});

// ~~~~ REQUEST HANDLER FOR MY PAGE ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR ACCOUNT INFO ~~~~ (BELOW) //

var server_account		=	require("./server_account_info");

app.get("/account-info", function(req, res) {
	res.render("pages/account_info.html");
});

app.get("/acc-personal", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_mypage.getPersonal(req, res, req.session.uid);
});

app.post("/submit-profile-edit", upload.single("profile-pic"), function(req, res) {
	console.log(req.file);
	console.log(req.body);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postEdittedProfile(req, res);
});

app.post("/acc-friends", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.getFriends(req, res);
});

app.post("/acc-categories", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.getCategory(req, res);
});

app.post("/submit-category-edit", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postEdittedCat(req, res);
});

app.post("/submit-manage-edit", upload.single("upload-header-bg"), function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postSubmitManageEdit(req, res);
});

app.post("/submit-modify-pass", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postModifyPass(req, res);
});

app.get("/delete-verif-code", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	delete req.session.code;
	delete req.session.infos;
	res.end(JSON.stringify({success: 1}));
});

app.post("/update-password", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postUpdatePassword(req, res);
});

app.post("/request-del-acc", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.postReqDelAcc(req, res);
});

app.get("/delete-account", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_account.getDelAcc(req, res);
});


// ~~~~ REQUEST HANDLER FOR ACCOUNT INFO ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR ADD POST ~~~~ (BELOW) //

var server_addpost	=	require("./server_add_post");

app.post("/add-post", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_addpost.addpost(req, res);
});

app.post("/load-post", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_addpost.loadPost(req, res);
});

app.post("/edit-post", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_addpost.editPost(req, res);
});


// ~~~~ REQUEST HANDLER FOR ADD POST ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR BLOG TRIP ~~~~ (BELOW) //

var server_blogtrip = 	require("./server_blog_trip");

app.get("/blog-trip", function(req, res) {
	res.render("pages/blog_trip.html");
});

app.post("/blog-trip-info", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_blogtrip.getBlogTripInfo(req, res);
});

// ~~~~ REQUEST HANDLER FOR BLOG TRIP ~~~~ (ABOVE) //

// ~~~~ REQUEST HANDLER FOR CHAT AND NOTIFICATION ~~~~ (BELOW) //
var server_nav 	= 	require("./server_nav");

var io_chat 	= 	io.of("/live-chat");
var io_notify	=	io.of("/notification");

io_chat.on("connection", function(socket) {
	socket.on("chat-connect", function(room) {
		socket.join(room, function() {
			console.log("Chat room: " + room + ", connected.");
		});
	});

	// socket.on("chat-leave", function(room) {
	// 	socket.leave(room, function() {
	// 		console.log("User left a room: " + room);
	// 	});
	// });

	socket.on("chat-message", function(room, msg) {
		io_chat.to(room).emit("send-message", msg);
	});
});

io_notify.on("connection", function(socket) {
	socket.on("notif-connect", function(room) {
		socket.join(room, function() {
			console.log("Notification room: " + room + ", connected.");
		});
	});

	socket.on("notif-user", function(room, notif) {
		io_notify.to(room).emit("notif-get", notif);
	});
});

app.get("/get-chat-lists", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.getChatLists(req, res);	
});

app.post("/get-chat-contents", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.getChatContents(req, res);
});

app.post("/submit-chat-msg", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.postChatMsg(req, res);
});

app.get("/get-unread-count", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.getUnreadCount(req, res);
});

app.post("/read-chat", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.postReadChat(req, res);
});

app.post("/open-newroom", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.postAndGetNewRoom(req, res);
});

//notification
app.get("/get-unseen-notif", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.getUnseenNotif(req, res);
});

app.get("/notification-lists", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.getNotificationLists(req, res);
});

app.post("/update-notif-unread", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.updateNotifUnread(req, res);
});

app.post("/add-notification", function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Content-Type", "application/json");
	server_nav.addNotification(req, res);
});

// ~~~~ REQUEST HANDLER FOR CHAT AND NOTIFICATION ~~~~ (ABOVE) //

// ~~~~ COMMON FUNCTION ~~~~ (BELOW) //

function sendSession(req, res) {
	var jsonToSend = [];
    var tempSess = req.session;
    //define content-type to avoid XHL parsing error in FireFox
    res.setHeader("Content-Type", "application/json");
    jsonToSend.push(tempSess);
    //send session in JSON form
	res.end(JSON.stringify(jsonToSend));
}

//i represents last i-th info of url
// For example, when we have url of "/blog/user-1/post-2", 
// i=1 will get [post, 2] and i=2 will get [user, 1]
// function parseUrl(url, i) {
// 	var parse = url.split("/");
// 	return parse[parse.length - 1].split("-");
// }

// ~~~~ COMMON FUNCTION ~~~~ (ABOVE) //

