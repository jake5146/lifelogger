/* Helper functions used in add_post_ajax.js, account_info_ajax.js
 * Organize categories in objects to display efficiently. */
function organizeCategories(rows) {
	//pObj contains sets of key:value where key is pcid and value is pname.
	var pObj = {};
	//pToCObj contains sets of key(pcid):value(array of cnames which are 
	// associated with key in ParentToChildCategory table).
	var pToCObj = {};

	$.each(rows, function(i, val) {
		if (!pObj[val.pcid]) {
			pObj[val.pcid] = val.pname;
		}

		if (pToCObj[val.pcid]) {
			pToCObj[val.pcid][val.ccid] = val.cname;
		} else {
			if (val.ccid) {
				pToCObj[val.pcid] = {};
				pToCObj[val.pcid][val.ccid] = val.cname;
			}
		}
	});

	return [pObj, pToCObj];
}

// Helper (callback) function for sort(). Then sort() will sort integers properly.
function sortFcn(a, b) {
	return a - b;
}

// Extract year-month-day (ex.2000-01-01) from given date.
function getDate(time) {
	var date = new Date(time);
	var month = date.getMonth() + 1;
	month = (month < 10) ? "0" + month: month;
	var day = (date.getDate() < 10) ? "0" + date.getDate(): date.getDate();
	return date.getFullYear() + "-" + month + "-" + day;
}

// merge first-middle-last name into Full name
function getFullName(first, middle, last) {
	var fullname = first;
	if (middle) {
		fullname += " " + middle
	}
	return fullname + " " + last;
}

//hide and show function for loader
function showLoader(className) {
    $(className).css("opacity", 0.5);
    $(".loader").show();
}

function hideLoader(className) {
    $(className).css("opacity", 1);
    $(".loader").hide();
}