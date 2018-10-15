var database 	=	require("./database_handler");

function getChatLists(req, res) {
	if (req.session.uid) {
		var query = "SELECT rc2.*, u2.profile AS profile2, u2.nick_name AS nick_name2, u2.first_name AS first_name2 " + 
						"FROM Users AS u2 " +
						"JOIN (SELECT rc.*, u.profile AS profile1, u.nick_name AS nick_name1, u.first_name AS first_name1 " + 
							"FROM Users AS u " + 
							"JOIN (SELECT recentChat.*, utuc2.user1, utuc2.user2 FROM UserToUserChat AS utuc2 " + 
								"JOIN (SELECT chat.* FROM ChatMessage AS chat " + 
									"JOIN (SELECT cm.chatid, MAX(cm.time_sent) AS time_sent FROM ChatMessage AS cm " + 
										"JOIN (SELECT chatid FROM UserToUserChat WHERE user1=? OR user2=?) AS utu " + 
										"ON cm.chatid=utu.chatid GROUP BY cm.chatid) AS recent " + 
									"ON chat.chatid=recent.chatid AND chat.time_sent=recent.time_sent) AS recentChat " + 
								"ON utuc2.chatid=recentChat.chatid) AS rc " + 
							"ON u.uid=rc.user1) AS rc2 " + 
						"ON u2.uid=rc2.user2 ORDER BY rc2.time_sent DESC";

		var vals = [req.session.uid, req.session.uid];
		database.query(req, res, query, vals, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function getChatContents(req, res) {
	if (req.session.uid) {
		var query = "SELECT * FROM ChatMessage WHERE chatid=? ORDER BY msgid DESC LIMIT ?,?";
		var val = [req.body.chatid, req.body.offset, req.body.offset + 10];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function postChatMsg(req, res) {
	if (req.session.uid) {
		var query = "INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (?,?,?,?)";
		var val = [req.body.chatid, req.body.message, req.body.time_sent, req.body.user_sent];
		database.query(req, res, query, val, ajaxSimplePostCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function getUnreadCount(req, res) {
	var uid = req.session.uid;
	if (uid) {
		var query = "SELECT cm.* FROM UserToUserChat AS utuc " + 
						"JOIN (SELECT chatid, user_sent, COUNT(unread) AS unread " + 
							  "FROM ChatMessage " + 
							  "WHERE unread=1 AND user_sent!=? " + 
							  "GROUP BY chatid, user_sent) AS cm " + 
						"ON (utuc.user1=? OR utuc.user2=?) AND utuc.chatid=cm.chatid";
		var val = [uid, uid, uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function postReadChat(req, res) {
	if (req.session.uid) {
		var query = "UPDATE ChatMessage SET unread=0 WHERE chatid=? AND user_sent!=?";
		var val = [req.body.chatid, req.session.uid];
		database.query(req, res, query, val, ajaxSimplePostCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function postAndGetNewRoom(req, res) {
	if (req.session.uid) {
		var query  = "SELECT chatid FROM UserToUserChat WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)";
		var val = [req.body.user1, req.body.user2, req.body.user2, req.body.user1];
		database.query(req, res, query, val, postAndGetNewRoomHandler);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function postAndGetNewRoomHandler(rows, req, res, callback) {
	if (rows.length > 0) {
		res.end(JSON.stringify(rows));
	} else {
		var query1 = "INSERT INTO UserToUserChat (user1, user2) VALUES (?, ?)";
		var query2 = "SELECT chatid FROM UserToUserChat WHERE user1=? AND user2=?";
		var val = [req.body.user1, req.body.user2];
		database.multiquery(req, res, [query1, query2], [val, val], ajaxSimpleGetCbFcn);
	}
}

function getUnseenNotif(req, res) {
	if (req.session.uid) {
		// var query = "SELECT COUNT(ncid) AS count FROM NotificationCenter AS nc " + 
		// 				"JOIN (SELECT nid FROM UserToUserNotification WHERE user1=? OR user2=?) AS utun " + 
		// 				"ON nc.nid=utun.nid WHERE unread=1";
		var query = "SELECT COUNT(ncid) AS count FROM NotificationCenter WHERE uid=? AND unread=1;"
		//var val = [req.session.uid, req.session.uid];
		var val = [req.session.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function getNotificationLists(req, res) {
	if (req.session.uid) {
		// var query = "SELECT nc.* FROM NotificationCenter AS nc " + 
		// 				"JOIN (SELECT nid FROM UserToUserNotification WHERE user1=? OR user2=?) AS utun " + 
		// 				"ON nc.nid=utun.nid WHERE user_sent!=? ORDER BY time_sent DESC LIMIT 20";
		var query = "SELECT * FROM NotificationCenter AS nc " + 
						"JOIN (SELECT uid AS user_sent, nick_name, profile, first_name FROM Users) AS u " + 
						"ON nc.user_sent=u.user_sent WHERE nc.uid=? ORDER BY nc.time_sent LIMIT 20";
		//var uid = req.session.uid;
		//var val = [uid, uid, uid];
		var val = [req.session.uid];
		database.query(req, res, query, val, ajaxSimpleGetCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function updateNotifUnread(req, res) {
	if (req.session.uid) {
		var query = "UPDATE NotificationCenter SET unread=0 WHERE uid=? AND ncid=?"
		console.log("uid: "+ req.body.uid + ", ncid: " + req.body.ncid);
		var val = [req.body.uid, req.body.ncid];
		database.query(req, res, query, val, ajaxSimplePostCbFcn);
	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}

function addNotification(req, res) {
	if (req.session.uid) {
		var query1 = "INSERT INTO NotificationCenter (uid, user_sent, category) VALUES (?,?,?)";
		var query2 = "SELECT * FROM NotificationCenter WHERE uid=? AND user_sent=? AND category=? " + 
					 "ORDER BY time_sent DESC LIMIT 1";
		var val = [req.session.uid, req.body.uid, req.body.category];
		database.multiquery(req, res, [query1, query2], [val, val], ajaxSimpleGetCbFcn);

	} else {
		var jsonL = {sessErr: "Session Expired. Please Try again."};
		res.end(JSON.stringify(jsonL));
	}
}


/* ***** Common Functions (BELOW) ***** */
function ajaxSimpleGetCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify(rows));
}

function ajaxSimplePostCbFcn(rows, req, res, callback) {
	res.end(JSON.stringify({success: 1}));
}
/* ***** Common Functions (ABOVE) ***** */


module.exports = {
	getChatLists: 			getChatLists,
	getChatContents: 		getChatContents,
	postChatMsg: 			postChatMsg,
	getUnreadCount: 		getUnreadCount,
	postReadChat: 			postReadChat,
	postAndGetNewRoom: 		postAndGetNewRoom,
	getUnseenNotif: 		getUnseenNotif,
	getNotificationLists: 	getNotificationLists,
	updateNotifUnread: 		updateNotifUnread,
	addNotification: 		addNotification
}