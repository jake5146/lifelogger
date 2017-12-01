--  DDL for Lifelogger database creation
DROP TABLE if exists Users;
DROP TABLE if exists Blog_post;
-- delete later
DROP TABLE if exists test_table;
DROP DATABASE if exists Lifelogger;
CREATE DATABASE Lifelogger;
USE Lifelogger;

CREATE TABLE Users 
(
	uid 			MEDIUMINT 		NOT NULL 	AUTO_INCREMENT,
	email 			VARCHAR(255) 	NOT NULL 	UNIQUE,
	password 		TEXT 			NOT NULL,
	first_name 		VARCHAR(40) 	NOT NULL,
	middle_name 	VARCHAR(40),
	last_name 		VARCHAR(40) 	NOT NULL,
	birthday 		DATE 			NOT NULL,
	gender 			VARCHAR(6) 		NOT NULL,
	nick_name		VARCHAR(40)		NOT NULL,
	phone_number 	VARCHAR(32),
    PRIMARY KEY (uid)
);

CREATE TABLE Blog_post
(
	uid 		MEDIUMINT 	NOT NULL,
	pid 		MEDIUMINT 	NOT NULL AUTO_INCREMENT,
	category 	VARCHAR(40) NOT NULL,
	contents 	LONGTEXT 	NOT NULL,
	time_post	TIMESTAMP	DEFAULT	CURRENT_TIMESTAMP,
	last_edit   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (uid,pid),
	FOREIGN KEY (uid) REFERENCES Users(uid)
) ENGINE=MyISAM;


CREATE TABLE Users_test 
(
	uid 			MEDIUMINT 		NOT NULL 	AUTO_INCREMENT,
	email 			VARCHAR(255) 	NOT NULL 	UNIQUE,
	password 		TEXT 			NOT NULL,
	first_name 		VARCHAR(40) 	NOT NULL,
	middle_name 	VARCHAR(40),
	last_name 		VARCHAR(40) 	NOT NULL,
	birthday 		DATE 			NOT NULL,
	gender 			VARCHAR(6) 		NOT NULL,
	nick_name		VARCHAR(40)		NOT NULL	UNIQUE,
	phone_number 	VARCHAR(32),
    PRIMARY KEY (uid)
);

INSERT INTO Users_test (email, password, first_name, last_name, gender, birthday, nick_name) 
				values("test1@test.com", "123456", "paul", "jhe", "male", "930101", "paaaaulu");
INSERT INTO Users_test (email, password, first_name, last_name, gender, birthday, nick_name) 
				values("test2@test.com", "123456", "jamie", "lee", "female", "940404", "jam");
INSERT INTO Users_test (email, password, first_name, last_name, gender, birthday, nick_name) 
				values("test3@test.com", "123456", "daniel", "kim", "male", "000707", "dan");
INSERT INTO Users_test (email, password, first_name, last_name, gender, birthday, nick_name, middle_name) 
				values("test4@test.com", "123456", "rora", "lim", "female", "980613", "ro", "AG");