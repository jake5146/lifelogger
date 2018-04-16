--  DDL for Lifelogger database creation
-- DROP TABLE if exists UserToParentCategory;
-- DROP TABLE if exists ParentToChildCategory;
-- DROP TABLE if exists UserToPost;
-- DROP TABLE if exists Posts;
-- DROP TABLE if exists Categories;
-- DROP TABLE if exists Users;
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
	uid 		BIGINT UNSIGNED NOT NULL,
	uidLiked	BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (uid, uidLiked),
	FOREIGN KEY (uid) 
		REFERENCES Users(uid)
		ON DELETE CASCADE,
	FOREIGN KEY (uidLiked) 
		REFERENCES Users(uid)
		ON DELETE CASCADE
);

CREATE TABLE ParentCategory
(
	uid		BIGINT UNSIGNED NOT NULL,
	pcid 	BIGINT UNSIGNED NOT NULL	AUTO_INCREMENT,
	pname	TEXT			NOT	NULL,
	PRIMARY KEY (uid, pcid),
	FOREIGN KEY (uid) 
		REFERENCES Users(uid)
		ON DELETE CASCADE
);

CREATE TABLE ChildCategory
(
	uid		BIGINT UNSIGNED NOT NULL,
	ccid 	BIGINT UNSIGNED NOT NULL	AUTO_INCREMENT,
	cname	TEXT			NOT	NULL,
	pcid 	BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (uid, ccid),
	FOREIGN KEY (uid) 
		REFERENCES Users(uid)
		ON DELETE CASCADE,
	FOREIGN KEY (pcid)
		REFERENCES ParentCategory(pcid)
		ON DELETE CASCADE
);

-- If cid is NULL, then post belongs to "All" category;
CREATE TABLE Posts
(
	uid			BIGINT UNSIGNED NOT NULL,
	postid 		BIGINT UNSIGNED NOT NULL 	AUTO_INCREMENT,
	title		TEXT			NOT NULL,
	pcid		BIGINT UNSIGNED,
	ccid		BIGINT UNSIGNED,
	contents 	LONGTEXT 		NOT NULL,
	likes		BIGINT UNSIGNED NOT NULL	DEFAULT 0,
	temporary	TINYINT			NOT NULL,
	time_post	TIMESTAMP		DEFAULT	CURRENT_TIMESTAMP,
	last_edit   TIMESTAMP   	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (uid, postid),
	FOREIGN KEY (pcid)
		REFERENCES ParentCategory(pcid)
		ON DELETE CASCADE,
    FOREIGN KEY (ccid)
		REFERENCES ChildCategory(ccid)
		ON DELETE CASCADE,
	FOREIGN KEY (uid)
		REFERENCES Users(uid)
		ON DELETE CASCADE
);



INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
VALUES (1, "test1@test.com", "1", "Tester", "One", "1997-01-05", "Male", "Mr.Tester");

INSERT INTO Users (uid, email, password, first_name, last_name, birthday, gender, nick_name) 
VALUES (2, "test2@test.com", "1", "Tester", "Two", "1997-03-06", "Female", "Ms.Tester");

-- INSERT INTO Categories VALUES (1, "p1");
-- INSERT INTO Categories VALUES (2, "p2");
-- INSERT INTO Categories VALUES (3, "p3");
-- INSERT INTO Categories VALUES (4, "p4");

INSERT INTO ParentCategory (uid, pname) VALUES (1, "p1");
INSERT INTO ParentCategory (uid, pname) VALUES (1, "p2");
INSERT INTO ParentCategory (uid, pname) VALUES (1, "p3");
INSERT INTO ParentCategory (uid, pname) VALUES (1, "p4");

INSERT INTO ParentCategory (uid, pname) VALUES (2, "A1");
INSERT INTO ParentCategory (uid, pname) VALUES (2, "A2");
INSERT INTO ParentCategory (uid, pname) VALUES (2, "A3");
INSERT INTO ParentCategory (uid, pname) VALUES (2, "A4");

-- INSERT INTO UserToParentCategory VALUES (1, 1);
-- INSERT INTO UserToParentCategory VALUES (1, 2);
-- INSERT INTO UserToParentCategory VALUES (1, 3);
-- INSERT INTO UserToParentCategory VALUES (1, 4);

-- INSERT INTO Categories VALUES (5, "c1");
-- INSERT INTO Categories VALUES (6, "c2");
-- INSERT INTO Categories VALUES (7, "c3");
-- INSERT INTO Categories VALUES (8, "c4");
-- INSERT INTO Categories VALUES (9, "c5");

INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c1", 1);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c2", 1);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c3", 2);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c4", 3);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (1, "c5", 3);

INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B1", 3);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B2", 3);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B3", 4);
INSERT INTO ChildCategory (uid, cname, pcid) VALUES (2, "B4", 4);

-- INSERT INTO ParentToChildCategory VALUES (1, 5);
-- INSERT INTO ParentToChildCategory VALUES (1, 6);
-- INSERT INTO ParentToChildCategory VALUES (2, 7);
-- INSERT INTO ParentToChildCategory VALUES (3, 8);
-- INSERT INTO ParentToChildCategory VALUES (3, 9);
delimiter //


CREATE PROCEDURE myproc1()
BEGIN
    DECLARE i int DEFAULT 1;
    WHILE i <= 10000 DO
        INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CONCAT(i), 1, 1, "", 0);
        SET i = i + 1;
    END WHILE;
END//

CREATE PROCEDURE myproc2()
BEGIN
    DECLARE i int DEFAULT 10001;
    WHILE i <= 20000 DO
        INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 1, 2, "random", 0);
        SET i = i + 1;
    END WHILE;
END//

CREATE PROCEDURE myproc3()
BEGIN
    DECLARE i int DEFAULT 20001;
    WHILE i <= 30000 DO
        INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 2, 3, "random", 0);
        SET i = i + 1;
    END WHILE;
END//

CREATE PROCEDURE myproc4()
BEGIN
    DECLARE i int DEFAULT 30001;
    WHILE i <= 40000 DO
        INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 3, 4, "random", 0);
        SET i = i + 1;
    END WHILE;
END//

CREATE PROCEDURE myproc5()
BEGIN
    DECLARE i int DEFAULT 40001;
    WHILE i <= 50000 DO
        INSERT INTO Posts (uid, title, pcid, ccid, contents, temporary) VALUES (1, CAST(i AS CHAR), 3, 5, "random", 0);
        SET i = i + 1;
    END WHILE;
END//

delimiter ;

CALL myproc1();
CALL myproc2();
CALL myproc3();
CALL myproc4();
CALL myproc5();