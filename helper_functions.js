// JavaScript for helper functions

// Helper function for cloning object
function cloneObj(obj) {
	var clone = {};
	var keys = Object.keys(obj);
	keys.forEach(function(key) {
		clone[key] = obj[key];
	});
	return clone;
}

module.exports = {
	clone: cloneObj
}