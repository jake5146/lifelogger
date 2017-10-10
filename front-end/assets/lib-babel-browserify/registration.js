"use strict";

var _navSettings = require("./navSettings.js");

var _navSettings2 = _interopRequireDefault(_navSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// javascript for registration.html
$(document).ready(function () {
	//setup navbar events
	(0, _navSettings2.default)();
});