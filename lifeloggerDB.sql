SET FOREIGN_KEY_CHECKS = 0;
SELECT concat('DROP TABLE IF EXISTS ', table_name, ';')
FROM information_schema.tables
WHERE table_schema = 'Lifelogger';
SET FOREIGN_KEY_CHECKS = 1;
-- delete later
DROP DATABASE if exists Lifelogger;
CREATE DATABASE Lifelogger;
SET default_storage_engine=MYISAM;
USE Lifelogger;

CREATE TABLE Users 
(
	uid 			BIGINT UNSIGNED NOT NULL 	AUTO_INCREMENT,
	email 			VARCHAR(255) 	NOT NULL 	UNIQUE,
	password 		TEXT 			NOT NULL,
	first_name 		VARCHAR(40) 	NOT NULL,
	middle_name 	VARCHAR(40),
	last_name 		VARCHAR(40) 	NOT NULL,
	birthday 		DATE 			NOT NULL,
	gender 			VARCHAR(6) 		NOT NULL,
	nick_name		VARCHAR(40)		NOT NULL	UNIQUE,
	phone_number 	VARCHAR(32),
	about			VARCHAR(255),
	profile			TEXT,
	blog_title		TEXT,
	header_color	TEXT,
	header_bg		TEXT,
	footer_sent		TEXT,
    PRIMARY KEY (uid)
);

CREATE TABLE WhoLikedBlogs
(
	uid 		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	uidLiked	BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	PRIMARY KEY (uid, uidLiked)
);

CREATE TABLE Friends
(
	friendOne		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	friendTwo		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	PRIMARY KEY (friendOne, friendTwo)
);

CREATE TABLE ParentCategory
(
	uid		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	pcid 	BIGINT UNSIGNED NOT NULL	AUTO_INCREMENT,
	pname	TEXT			NOT	NULL,
	PRIMARY KEY (uid, pcid)
);

CREATE TABLE ChildCategory
(
	uid		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	ccid 	BIGINT UNSIGNED NOT NULL	AUTO_INCREMENT,
	cname	TEXT			NOT	NULL,
	pcid 	BIGINT UNSIGNED NOT NULL, -- foreign key References ParentCategory(pcid)
	PRIMARY KEY (uid, ccid)
);

-- If cid is NULL, then post belongs to "All" category;
CREATE TABLE Posts
(
	uid			BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	postid 		BIGINT UNSIGNED NOT NULL 	AUTO_INCREMENT,
	title		TEXT			NOT NULL,
	pcid		BIGINT UNSIGNED, -- foreign key References ParentCategory(pcid)
	ccid		BIGINT UNSIGNED, -- foreign key References ChildCategory(ccid)
	contents 	LONGTEXT 		NOT NULL,
	likes		BIGINT UNSIGNED NOT NULL	DEFAULT 0,
	temporary	TINYINT			NOT NULL,
	time_post	TIMESTAMP		DEFAULT	CURRENT_TIMESTAMP,
	last_edit   TIMESTAMP   	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (uid, postid)
);

CREATE TABLE UserToUserChat
(
	chatid  	BIGINT UNSIGNED NOT NULL	AUTO_INCREMENT,
	user1		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	user2   	BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	PRIMARY KEY (chatid)
);

CREATE TABLE ChatMessage 
(
	chatid		BIGINT UNSIGNED NOT NULL, -- foreign key References UserToUserChat(chatid)
	msgid		BIGINT UNSIGNED NOT NULL 	AUTO_INCREMENT,
	message 	TEXT			NOT NULL,
	time_sent 	TIMESTAMP 		DEFAULT 	CURRENT_TIMESTAMP,
	user_sent 	BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid),
	unread 		TINYINT 		NOT NULL DEFAULT 1,
	PRIMARY KEY (chatid, msgid)
);


CREATE TABLE NotificationCenter
(
	uid 		BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid)
	ncid 		BIGINT UNSIGNED NOT NULL 	AUTO_INCREMENT, -- notification center id
	time_sent	TIMESTAMP 		DEFAULT 	CURRENT_TIMESTAMP,
	user_sent 	BIGINT UNSIGNED NOT NULL, -- foreign key References Users(uid),
	category 	TEXT 			NOT NULL, -- (request / accepted / liked)
	unread 		TINYINT 		NOT NULL 	DEFAULT 1,
	PRIMARY KEY (uid, ncid)
);




-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (1, "test1@test.com", "1", "Tester", "One", "1997-01-05", "Male", "Mr.Tester");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (2, "test2@test.com", "1", "Tester", "Two", "1997-03-06", "Female", "Ms.Tester");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (3, "test3@test.com", "1", "Tester", "Three", "1997-03-07", "male", "Mr.Tester2");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (4, "test4@test.com", "1", "Tester", "Four", "1997-03-08", "Female", "Ms.Tester2");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (5, "test5@test.com", "1", "Tester", "Five", "1997-03-09", "male", "Mr.Tester3");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (6, "test6@test.com", "1", "Tester", "Six", "1996-02-08", "male", "Mr.Tester6");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (7, "test7@test.com", "1", "Tester", "Seven", "1997-07-07", "male", "Mr.Tester7");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (8, "test8@test.com", "1", "Tester", "Eight", "1998-08-09", "Female", "Ms.Tester8");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (9, "test9@test.com", "1", "Tester", "Nine", "1999-09-12", "male", "Mr.Tester9");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (10, "test10@test.com", "1", "Tester", "Ten", "2010-05-24", "Female", "Ms.Tester10");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (11, "test11@test.com", "1", "Tester", "Eleven", "1911-12-09", "male", "Mr.Tester11");

-- INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
-- VALUES (12, "test12@test.com", "1", "Tester", "Twelve", "1912-11-09", "Female", "Ms.Tester12");

-- INSERT INTO Friends VALUES (1, 2);
-- INSERT INTO Friends VALUES (2, 1);

-- INSERT INTO Friends VALUES (1, 3);
-- INSERT INTO Friends VALUES (3, 1);

-- INSERT INTO Friends VALUES (1, 4);

-- INSERT INTO Friends VALUES (5, 1);


-- INSERT INTO ParentCategory (uid, pname) VALUES (1, "p1");
-- INSERT INTO ParentCategory (uid, pname) VALUES (1, "p2");
-- INSERT INTO ParentCategory (uid, pname) VALUES (1, "p3");
-- INSERT INTO ParentCategory (uid, pname) VALUES (1, "p4");

-- INSERT INTO ParentCategory (uid, pname) VALUES (2, "A1");
-- INSERT INTO ParentCategory (uid, pname) VALUES (2, "A2");
-- INSERT INTO ParentCategory (uid, pname) VALUES (2, "A3");
-- INSERT INTO ParentCategory (uid, pname) VALUES (2, "A4");

-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c1", 1);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c2", 1);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c3", 2);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c4", 3);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c5", 3);

-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B1", 3);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B2", 3);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B3", 4);
-- INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B4", 4);

-- delimiter //


-- CREATE PROCEDURE myproc1()
-- BEGIN
--     DECLARE i int DEFAULT 1;
--     WHILE i <= 10000 DO
--         INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CONCAT(i), 1, 1, "", 0);
--         SET i = i + 1;
--     END WHILE;
-- END//

-- CREATE PROCEDURE myproc2()
-- BEGIN
--     DECLARE i int DEFAULT 10001;
--     WHILE i <= 20000 DO
--         INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 1, 2, "random", 0);
--         SET i = i + 1;
--     END WHILE;
-- END//

-- CREATE PROCEDURE myproc3()
-- BEGIN
--     DECLARE i int DEFAULT 20001;
--     WHILE i <= 30000 DO
--         INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 2, 3, "random", 0);
--         SET i = i + 1;
--     END WHILE;
-- END//

-- CREATE PROCEDURE myproc4()
-- BEGIN
--     DECLARE i int DEFAULT 30001;
--     WHILE i <= 40000 DO
--         INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 3, 4, "random", 0);
--         SET i = i + 1;
--     END WHILE;
-- END//

-- CREATE PROCEDURE myproc5()
-- BEGIN
--     DECLARE i int DEFAULT 40001;
--     WHILE i <= 50000 DO
--         INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 3, 5, "random", 0);
--         SET i = i + 1;
--     END WHILE;
-- END//

-- delimiter ;

-- CALL myproc1();
-- CALL myproc2();
-- CALL myproc3();
-- CALL myproc4();
-- CALL myproc5();


-- INSERT INTO UserToUserChat VALUES (1, 1, 2);
-- INSERT INTO UserToUserChat VALUES (2, 1, 3);
-- INSERT INTO UserToUserChat VALUES (3, 1, 4);
-- INSERT INTO UserToUserChat VALUES (4, 1, 5);
-- INSERT INTO UserToUserChat VALUES (5, 1, 6);

-- INSERT INTO UserToUserChat VALUES (6, 3, 4);
-- INSERT INTO UserToUserChat VALUES (7, 5, 4);


-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent, unread) VALUES (1, "Hi-0", "2018-07-12 17:01:00", 2, 0);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Hi-1", "2018-07-12 17:01:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Hi-1", "2018-07-12 17:01:02", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Hi-2", "2018-07-12 17:01:03", 2);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (6, "Hi-3", "2018-07-12 17:01:04", 3);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (6, "Hi-4", "2018-07-12 17:01:05", 4);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (2, "I will be late sorry.", "2018-07-12 17:01:06", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (2, "I will be late too.", "2018-07-12 17:01:07", 3);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "How are you today?", "2018-07-12 17:01:08", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "I'm fine. Thanks.", "2018-07-12 17:01:09", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "What's up?", "2018-07-12 17:01:11", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "I just wanna say hello to you.", "2018-07-12 17:01:21", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "LOL.", "2018-07-12 17:01:31", 2);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "Yo did you watch that?", "2018-07-12 17:01:41", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "What is that.", "2018-07-12 17:01:51", 4);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "That. Marvel.", "2018-07-12 17:02:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "Antman?.", "2018-07-12 17:02:01", 4);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "No. I don't want to.", "2018-07-12 17:03:01", 4);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "Whyyyyy", "2018-07-12 17:04:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (3, "Just don't want.", "2018-07-12 17:05:01", 4);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "What are you doing today?", "2018-07-12 17:06:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "I mean... you have a time tonight?", "2018-07-12 17:07:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Hmm.. I have an appointment", "2018-07-12 17:08:01", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "But tomorrow will be good", "2018-07-12 17:09:01", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Did you watch Antman and Wasp?", "2018-07-12 17:11:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "No. Not yet.", "2018-07-12 17:21:01", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Let's go watch it!", "2018-07-12 17:31:01", 1);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Sure :). Which restaurant do you wanna go?", "2018-07-12 17:41:01", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "I mean I know one good place", "2018-07-12 17:51:01", 2);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Wherever you want. I love any kinds.", "2018-07-12 17:52:01", 1);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (6, "Are you coming now?", "2018-07-12 17:53:01", 3);
-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (6, "5 min. Please", "2018-07-12 17:54:01", 4);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (1, "Great. See you then!", "2018-07-12 17:55:01", 2);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (4, "Let's play a game", "2018-07-12 17:57:01", 5);

-- INSERT INTO ChatMessage (chatid, message, time_sent, user_sent) VALUES (5, "Hmmmmm....", "2018-07-12 17:58:01", 1);


-- INSERT INTO NotificationCenter (uid, user_sent, category, unread) VALUES (1, 7, "requested", 0);
-- INSERT INTO NotificationCenter (uid, user_sent, category, unread) VALUES (1, 4, "accepted", 0);
-- INSERT INTO NotificationCenter (uid, user_sent, category, unread) VALUES (1, 8, "liked", 1);
-- INSERT INTO NotificationCenter (uid, user_sent, category, unread) VALUES (2, 3, "liked", 1);




