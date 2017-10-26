// database handler
var mysql 		= 	require("mysql");
///var $			=	require("jquery");

// create pool to prevent server crash in case of many concurrent access
var pool	=	mysql.createPool({
	connectionLimit	: 100, //important
	host			: 'localhost',
	user			: 'root',
	password		: 'root',
	database		: 'Lifelogger',
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
			res.json({"code": 100, "status": "Error in connection database", 
				"message": poolErr});
			return;
		}

		console.log("connected as id " + connection.threadId);

		connection.query(sqlQuery, queryVals, function(queryErr, rows) {
			console.log(queryErr);
			connection.release();
			queryFcn(queryErr, rows, req, res, fcnCallback);
		});

		connection.on("error", function(err) {
			res.json({"code": 100, "status": "Error in connection database"});
			return;
		})
	});
}

module.exports = {
	query: databaseHandler
}