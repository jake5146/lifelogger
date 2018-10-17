// AJAX request handler for nav_settings
var userid;
var currentChatId;
var chatOffset = 0;
var chatScrollOffset = 0;
var ffinderOffset = 0;
var isChatAllUploaded = false;

var liveChat        = io.connect("https://aqueous-brook-45465.herokuapp.com/live-chat", {secure: true});
var notification    = io.connect("https://aqueous-brook-45465.herokuapp.com/notification", {secure: true});

$(document).ready(function() { 
	checkUserLogin();
});

function defaultSetOnDocReady() {
    //TODO:: save chatData according to userid;
    if (typeof(Storage) !== "undefined") {
        var chatData = JSON.parse(sessionStorage.getItem("savedChatInfo-" + userid));
        if (chatData) openChatOnClick(chatData);
    }

    $("#live-chat-top .glyphicon-remove").click(function() {
        $("#live-chat-container").hide();

        if (typeof(Storage) !== "undefined") sessionStorage.removeItem("savedChatInfo-" + userid);
        //liveChat.emit("chat-leave", $("#chatbox-msg-form").attr("class"));
    });

    $("#chatbox-msg-form").submit(function(e) {
        submitChatMsg(e);
    });

    $("textarea[name='chat']").keypress(function(e) {
        if (e.which == 13) {
            submitChatMsg(e);
        }
    });

    liveChat.on("send-message", function(msg) {
        console.log(msg);
        var msgInfo = JSON.parse(msg);
        var formChatid = $("#chatbox-msg-form").attr("class").replace("room-", "");

        if (msgInfo.chatid == formChatid) {
            addChatMessage(msgInfo, true);
            $("textarea[name='chat']").val("");
            $("#live-chat-contents").scrollTop($("#live-chat-contents")[0].scrollHeight);
            $('[data-toggle="tooltip"]').tooltip();
        }

        if (msgInfo.user_sent !== userid) {
            if (!((msgInfo.chatid == formChatid) && 
             ($("#live-chat-contents").css("height") === "208px"))) {
                 console.log("unread msg");
                //update total badge count
                incrementBadgeNumber($(".msg-total-badge"));
                
                //update chat room's badge count
                incrementBadgeNumber($(".list-friend-msger.chat-" + msgInfo.chatid + " .badge"));
            } else {
                console.log("read it");
                updateChatUnreadBadge(msgInfo.chatid);
            }
        }
    });

    //toggle messanger/notification blocks (go to nav_settings_ajax.js)
    $("#messanger-button").click(function() {
        toggleNavWindows("#messanger-button", "#messanger-window");
        if ($("#messanger-window").hasClass("shown")) {
            displayChatLists();
        }
    });

    $("#notification-button").click(function() {
        toggleNavWindows("#notification-button", "#notification-window");
        if ($("#notification-window").hasClass("shown")) {
            displayNotificationLists();
        }
    });

    notification.on("notif-get", function(notif) {
        addNotification(notif);
    });
}

function incrementBadgeNumber($badge) {
    var count = $badge.text();
    count = (count === "") ? 0: parseInt(count);
    $badge.text(count + 1);
}

function submitChatMsg(e) {
    e.preventDefault();
    var message = $("textarea[name='chat']").val();
    if (message !== "") {
        var time = new Date($.now());
        time = getDate(time) + " " + getTime(time);
        var msgInfo = {user_sent: userid, chatid: currentChatId, 
                       time_sent: time, message: message};
        $.ajax({
            type: "POST",
            url: "/submit-chat-msg",
            contentType: "application/json",
            dataType: "JSON",
            data: JSON.stringify(msgInfo),
            success: function(res) {
                 if (res.msg) {
                    alert(res.msg);
                } else if (res.sessErr) {
                    alert(res.sessErr);
                } else {
                    var room = $("#chatbox-msg-form").attr("class");
                    liveChat.emit("chat-message", room, JSON.stringify(msgInfo));
                }
            },
            error(jqXHR, status, errorThrown) {
                console.log(jqXHR);
            }
        });
    }
}

function checkUserLogin() {
	$.ajax({
		type: "GET",
		url: "/check-user-login",
    	contentType: "application/json",
    	dataType: "JSON",
    	success: function(res) {
    		var sess = res[0];

    		if (!sess.email) {
    			$(".if-no-user").hide();

    			var $li = $("<li>");
    			var $a = $("<a>", {text: "Login", href: "/"});

    			$li.prepend($a);
    			$(".navbar-right").prepend($li);
    		} else {
                userid = sess.uid;
                defaultSetOnDocReady();
                getUnseenNotification();
                displayChatLists();
                loadFriendsForNewChat();
                displayNotificationLists();
                notification.emit("notif-connect", userid);
            }
    	},
    	error(jqXHR, status, errorThrown) {
    		console.log(jqXHR);
    	}
	});
}

function displayChatLists() {
    $(".sm-loader").show();
    $.ajax({
        type: "GET",
        url: "/get-chat-lists",
        contentType: "application/json",
        dataType: "JSON",
        success: function(res) {
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                $(".messanger-lists").empty();
                displayUnreadBadge(res);
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function displayUnreadBadge(chatlists) {
    $.ajax({
        type: "GET",
        url: "/get-unread-count",
        contentType: "application/json",
        dataType: "JSON",
        success: function(res) {
            $(".sm-loader").hide();
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                var i;
                for (i = 0; i < chatlists.length; i++) {
                    createChatList(chatlists[i]);
                }

                var j;
                var totalUnread = 0;
                for (j = 0; j < res.length; j++) {
                    console.log(res[j].unread);
                    $(".list-friend-msger.chat-" + res[j].chatid + " .badge").text(res[j].unread);
                    totalUnread += parseInt(res[j].unread);
                }

                $(".msg-total-badge").text((totalUnread > 0) ? totalUnread: "");
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function createChatList(info) {
    var $list = $("<div>", {
        class: "list-friend-msger chat-" + info.chatid
    });

    var $imgBox = $("<div>", {class: "inline-box msger-img-box"});

    var imgSrc = (info.user1 === userid) ? info.profile2: info.profile1;
    imgSrc = (imgSrc) ? "./uploads/" + imgSrc: "/assets/images/default-profile.gif";
    var $img = $("<img>", {
        class: "msger-profile-img",
        src: imgSrc,
        alt: "Profile Image"
    });

    $imgBox.append($img);

    var $contentBox = $("<div>", {class: "inline-box msger-content-box"});
    var nickname = (info.user1 === userid) ? info.nick_name2: info.nick_name1;
    var $nick = $("<span>", {
        class: "msger-nickname",
        text: nickname
    });
    var $lastMsg = $("<p>", {
        class: "msger-last-msg",
        text: info.message
    });

    $contentBox.append($nick, $lastMsg);

    var $dataBox = $("<div>", {class: "inline-box msger-date-box"});
    var $date = $("<span>", {
        class: "msger-latest",
        text: getDate(info.time_sent)
    });

    $dataBox.append($date);

    var $badge = $("<span>", {class: "badge"});

    $list.append($imgBox, $contentBox, $dataBox, $badge);

    $(".messanger-lists").append($list);
    liveChat.emit("chat-connect", "room-" + info.chatid);

    $list.dblclick(function() {
        var friendInfo = {};
        friendInfo.nickname = nickname;
        friendInfo.chatid = info.chatid;
        friendInfo.uid = (info.user1 === userid) ? info.user2: info.user1;
        friendInfo.firstname = (info.user1 === userid) ? info.first_name2: info.first_name1;

        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem("savedChatInfo-" + userid, JSON.stringify(friendInfo));
        }

        $(".nav-window.shown").hide();
        $("#external-navbar .shown").removeClass("shown");
        openChatOnClick(friendInfo);
    });
}

function openChatOnClick(info) {
    console.log(info);
    currentChatId = info.chatid;
    chatOffset = 0;
    updateChatUnreadBadge(info.chatid);

    $(".friend-blog-link").attr("href", 
                                "/blog/" + 
                                info.firstname.toLowerCase().replace(/\s+/, "") + 
                                "-" + info.uid);
    $("#live-chat-top .chatbox-title").text(info.nickname);

    //var prevRoom = $("#chatbox-msg-form").attr("class");
    //if (prevRoom) liveChat.emit("chat-leave", prevRoom);
    $("#chatbox-msg-form").removeClass();
    $("#chatbox-msg-form").addClass("room-" + info.chatid);

    //liveChat.emit("chat-connect", "room-" + info.chatid);

    $("#live-chat-container").show();
    $("#live-chat-container > *").show();
    $("#live-chat-contents").empty();

    getChatContents(info);

    $("#live-chat-contents").scroll(function() {getContentsOnScroll(info)});
}

function updateChatUnreadBadge(chatid) {
    $.ajax({
        type: "POST",
        url: "/read-chat",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({chatid: chatid}),
        success: function(res) {
            $(".sm-loader").hide();
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                console.log(chatid);
                var $badge = $(".list-friend-msger.chat-" + chatid + " .badge");
                if ($badge.text() !== "") {
                    var count = parseInt($badge.text());
                    var total = parseInt($(".msg-total-badge").text());
                    $(".msg-total-badge").text((total - count <= 0) ? "": total-count);
                    $badge.text("");
                }
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function getContentsOnScroll(info) {
    var $content = $("#live-chat-contents");
    var scTop = $content.scrollTop();
    //console.log(scTop);
    if ((scTop < $content[0].scrollHeight / 90) && 
        (scTop - chatScrollOffset < 0) && !isChatAllUploaded) {
        getChatContents(info);
    }
    chatScrollOffset = scTop;
}

function getChatContents(info) {
    $(".sm-loader").show();
    var $content = $("#live-chat-contents");
    $content.off("scroll");
    $.ajax({
        type: "POST",
        url: "/get-chat-contents",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({chatid: info.chatid, offset: chatOffset}),
        success: function(res) {
            $(".sm-loader").hide();
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                var i;
                for (i = 0; i < res.length; i++) {
                    addChatMessage(res[i], false);
                }

                if (chatOffset === 0) {
                    $content.scrollTop($content[0].scrollHeight);
                    //console.log($content[0].scrollHeight);
                }

                chatOffset += i;
                if (i === 0) isChatAllUploaded = true;
                //console.log(chatOffset);

                $(".chat-talk").last().addClass("chat-recent");
                $('[data-toggle="tooltip"]').tooltip();
                $content.scroll(function() {getContentsOnScroll(info)});
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });

}

function addChatMessage(chatInfo, isLive) {     
    var $chatTalk = (isLive) ? $(".chat-recent"): $(".chat-talk").first();
    var whoSent = (chatInfo.user_sent == userid) ? "mine": "friend";
    var tipDirection = "left";

    var $talk = $("<div>", {
        "data-toggle": "tooltip",
        "data-placement": tipDirection,
        "data-container": "body",
        title: chatInfo.time_sent,
        class: "talk-" + whoSent
    });
    var $span = $("<span>", {text: chatInfo.message});
    $talk.append($span);

    if ($chatTalk.hasClass("chat-" + whoSent)) {
        if (isLive) $chatTalk.append($talk);
        else $chatTalk.prepend($talk);
    } else {
        var $talkDiv = $("<div>", {
            class: "chat-talk chat-" + whoSent 
        });

        $talkDiv.append($talk);

        if (isLive) {
            $(".chat-recent").removeClass("chat-recent");
            $talkDiv.addClass("chat-recent");
            $("#live-chat-contents").append($talkDiv);
        } else {
            $("#live-chat-contents").prepend($talkDiv);
        }
    }
}

// function for searching friends to add new chat
function loadFriendsForNewChat() {
    $("a.new-msg").click(initFriendsSearchForNewChat);
    $("input[name='ffinder']").keyup(initFriendsSearchForNewChat);
    $(".expand-list-btn button").click(function() {
        getFriendsForNewChat(false, ffinderOffset);
    });
}

function initFriendsSearchForNewChat() {
    $(".sm-loader").show();
    ffinderOffset = 0;
    getFriendsForNewChat(true, ffinderOffset);
}

function getFriendsForNewChat(isSearch, offset) {
    $.ajax({
        type: "POST",
        url: "/acc-friends",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({keyword: $("input[name='ffinder']").val(), 
                              offset: ffinderOffset}),
        success: function(res) {
            $(".sm-loader").hide();
            if (res.msg) { //in case of query error.
                alert(res.msg);
            } else {
                if (res.length < 5) $(".expand-list-btn button").addClass("disabled");
                else $(".expand-list-btn button").removeClass("disabled");

                var $flists = $(".ffinder-lists");
                if (isSearch) $flists.empty();

                var i;
                for (i = 0; i < res.length; i++) {
                    addFriendListForNewChat(res[i]);
                }
                ffinderOffset += i;
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

// function for adding new chat
function addFriendListForNewChat(info) {
    var $list = $("<div>", {
        class: "ffinder list-friend-msger chat-"
    });

    var $imgBox = $("<div>", {class: "inline-box msger-img-box"});

    var imgSrc = (info.profile) ? "./uploads/" + info.profile: "/assets/images/default-profile.gif";
    var $img = $("<img>", {
        class: "msger-profile-img",
        src: imgSrc,
        alt: "Profile Image"
    });

    $imgBox.append($img);

    var $contentBox = $("<div>", {class: "inline-box msger-content-box"});
    var $nick = $("<span>", {
        class: "msger-nickname",
        text: info.nick_name
    });

    $contentBox.append($nick);

    $list.append($imgBox, $contentBox);

    $(".ffinder-lists").append($list);

    $list.dblclick(function() {
        var friendInfo = {};
        friendInfo.nickname = info.nick_name;
        friendInfo.uid = info.uid;
        friendInfo.firstname = info.first_name;

        openNewChatRoom(friendInfo);
    });
}

function openNewChatRoom(friendInfo) {
     $.ajax({
        type: "POST",
        url: "/open-newroom",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({user1: userid, user2: friendInfo.uid}),
        success: function(res) {
            if (res.msg) { //in case of query error.
                alert(res.msg);
            } else {
                liveChat.emit("chat-connect", "room-" + res[0].chatid);
                friendInfo.chatid = res[0].chatid;
                if (typeof(Storage) !== "undefined") {
                    sessionStorage.setItem("savedChatInfo-" + userid, JSON.stringify(friendInfo));
                }

                $(".nav-window.shown").hide();
                $("#external-navbar .shown").removeClass("shown");
                $("#msger-ffinder-modal button.close").trigger("click");
                openChatOnClick(friendInfo);
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

/* ***** Notification Section ***** */

var notif_msg = {
    "requested":  " requested to be your friend.",
    "accepted": " accepted your friend request.",
    "liked":    " liked your blog."
}

function getUnseenNotification() {
    $.ajax({
        type: "GET",
        url: "/get-unseen-notif",
        contentType: "application/json",
        dataType: "JSON",
        success: function(res) {
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                var count = parseInt(res[0].count);
                $(".notif-total-badge").text((count > 0) ? count: "");
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function displayNotificationLists() {
    //@@TODO:: 1. design query for getting notification lists clearly
    //         2. make function for displaying notification lists
    //         3. mark unread notif to read when double clicked on notification 
    //         4. display only 20 notifications
    //         
    //         5. send notification when accepting friends, requesting friends, like the blog
    //         - sending process is like this: check if nid already exists:
    //         - if nid not exists, create room and send it through
    $(".sm-loader").show();
    $.ajax({
        type: "GET",
        url: "/notification-lists",
        contentType: "application/json",
        dataType: "JSON",
        success: function(res) {
            $(".sm-loader").hide();
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                $("div.notification-lists").empty();
                var i;
                for (i = 0; i < res.length; i++) {
                    prependNotificationList(res[i]);
                }
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function prependNotificationList(info) {
    var unread = (info.unread) ? " list-notif-unread": "";
    var $list = $("<div>", {
        class: "list-notification ncid-" + info.ncid + unread
    });

    var $imgBox = $("<div>", {
        class: "inline-box msger-img-box"
    });

    var imgSrc = (info.profile) ? "./uploads/" + info.profile: "/assets/images/default-profile.gif";
    var $img = $("<img>", {
        class: "msger-profile-img",
        src: imgSrc,
        alt: "Profile Image"
    });

    $imgBox.append($img);

    var $content = $("<div>", {
        class: "inline-box notif-content-box"
    });

    var $nickname = $("<span>", {
        class: "notif-nickname",
        text: info.nick_name
    });

    var $msg = $("<span>", {
        class: "notif-msg",
        text: notif_msg[info.category]
    });

    $content.append($nickname, $msg);

    $list.append($imgBox, $content);

    $("div.notification-lists").prepend($list);

    $list.dblclick(function() {
        updateOnNotificationRead(info);
    });

}

function updateOnNotificationRead(info) {
    $.ajax({
        type: "POST",
        url: "/update-notif-unread",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify({uid: info.uid, ncid: info.ncid}),
        success: function(res) {
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                console.log("ncid: " + info.ncid);
                $(".list-notification.ncid-" + info.ncid).removeClass("list-notif-unread");
                var first_name = info.first_name.toLowerCase().replace(/\s+/, "");
                window.location.href =  "/blog/" + first_name + "-" + info.user_sent;
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function addNotification(info) {
    $.ajax({
        type: "POST",
        url: "/add-notification",
        contentType: "application/json",
        dataType: "JSON",
        data: info,
        success: function(res) {
            if (res.msg) {
                alert(res.msg);
            } else if (res.sessErr) {
                alert(res.sessErr);
            } else {
                var newInfo = res[0];
                newInfo.nick_name = info.nick_name;
                newInfo.profile = info.profile;
                newInfo.first_name = info.first_name;
                prependNotificationList(newInfo);
                getUnseenNotification();
            }
        },
        error(jqXHR, status, errorThrown) {
            console.log(jqXHR);
        }
    });
}