// database handler
var mysql 		= 	require("mysql");
///var $			=	require("jquery");

// create pool to prevent server crash in case of many concurrent access
var pool	=	mysql.createPool({
	connectionLimit	: 10, //important
	host			: "us-cdbr-iron-east-01.cleardb.net",
	user			: "bc1ead2287888c",
	password		: "11d39bd9",
	database		: "heroku_24c76bdb1c0ec46",
	acquireTimeout  : 20000,
	connectTimeout  : 20000
});

// Database handler that creates connection and release when finished.
// @param1 req: request from user
// @param2 res: response to be sent to user. 
// @param3 sqlQuery: query for database to get information that user asks.
// @param4 queryVals: query values that user types if there is any (could be empty)
// @param5 queryFcn: handler for returned info from query. It establishes data and send it to the user.
// @param6 fcnCallback: callback function for queryFcn 
function databaseHandler(req, res, sqlQuery, queryVals, queryFcn, fcnCallback) {
	pool.getConnection(function(poolErr, connection) {
		console.log("connectionHandler poolErr: " + typeof poolErr);
		console.log("connectionHandler connection: " + typeof connection);
		if (poolErr) {
			console.log("poolErr::");
			console.log(poolErr);
			res.json({"code": 100, "status": "Error in connection database", 
				msg: poolErr});
			return;
		}

		console.log("connected as id " + connection.threadId);

		connection.query(sqlQuery, queryVals, function(queryErr, rows) {
			connection.release();
			if (queryErr) {
				console.log(queryErr);
				var jObj = {msg: queryErr};
				res.end(JSON.stringify(jObj));
			} else {
				queryFcn(rows, req, res, fcnCallback);
			}
		});

		connection.on("error", function(err) {
			console.log("connection on error::");
			console.log(err);
			//res.json({"code": 100, "status": "Error in connection database", msg: err});
			return;
		});
	});
}

function multipleQueryHandler(req, res, queries, queryVals, resultFcn) {
	pool.getConnection(function(poolErr, connection) {
		console.log("connectionHandler poolErr: " + typeof poolErr);
		console.log(poolErr);
		console.log("connectionHandler connection: " + typeof connection);
		if (poolErr) {
			res.json({"code": 100, "status": "Error in connection database", 
				"message": poolErr});
			return;
		}

		console.log("connected as id " + connection.threadId);

		// connection.query(sqlQuery, queryVals, function(queryErr, rows) {
		// 	connection.release();
		// 	queryFcn(queryErr, rows, req, res, fcnCallback);
		// });
		var i = 0;
		queryProcessor(req, res, connection, i, queries, queryVals, resultFcn);

		connection.on("error", function(err) {
			//res.json({"code": 100, "status": "Error in connection database", msg: err});
			return;
		});
	});
}

function queryProcessor(req, res, connection, i, queries, queryVals, resultFcn) {
	connection.query(queries[i], queryVals[i], function(queryErr, rows) {
		console.log("------------");
		console.log(queries[i]);
		console.log(queryVals[i]);
		var jobj = {};

		if (queryErr) {
			console.log(queryErr);
			jobj.msg = queryErr;
			res.end(JSON.stringify(jobj));
		} else {
			if (i < queries.length - 1) {
				queryProcessor(req, res, connection, i+1, queries, queryVals, resultFcn);
			} else {
				connection.release();
				resultFcn(rows, req, res);
			}
		}
	});
}

module.exports = {
	query: 		databaseHandler,
	multiquery: multipleQueryHandler
}