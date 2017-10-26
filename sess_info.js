//session information will be defined here.

//7 day * 24 hr/day * 60 min/hr * 60 s/min * 1000 ms/s = 1 week in ms
var week = 7 * 24 * 60 * 60 * 1000;

//@@test purpose@@
var testAge = 120 * 1000;
//@@            @@

module.exports = {
	secret: 'WtYDbhYd1Dj63Sd',
	resave: false,
	saveUninitialized: false,
	cookie: {
		//secure: true,
		maxAge : testAge
	}
}