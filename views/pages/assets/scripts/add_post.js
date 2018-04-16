// javascript for add_post.html
$(document).ready(function() {
	addOptionsToFontAndSizeSelect();

	displayAreaEventListener();

	propertiesButtonInit();

	fontAndBgColor();
});

// add font family options to 'add post' section.
function addOptionsToFontAndSizeSelect() {
	var fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Times", "Courier New",
	                     "Courier", "Verdana", "Georgia", "Palatino", "Garamond",
	                     "Bookman", "Comic Sans MS", "Trebuchet MS", "Arial Black", 
	                     "Impact"];

	var fontsizes = [10, 13, 16, 18, 24, 32, 48];

	fontAndSizeChangeHandler(".change-font", fontFamilies, "Arial");
	fontAndSizeChangeHandler(".change-fontsize", fontsizes, 2);
}

// add font size options to 'add post' section
function fontAndSizeChangeHandler(className, options, defaultOption) {
	var isFont = className === ".change-font";
	var i;
	for (i = 0; i < options.length; i++) {
		var val = (isFont) ? options[i]: i + 1;
		var txt = (isFont) ? options[i]: (options[i] + "px");
		var $option = $("<option>", {value: val, text: txt});
		$(className).append($option);
	}

	$(className).val(defaultOption);

	$(className).change(function() {

		var value = $(className + " option:selected").val();
		value = (isFont) ? value: parseInt(value);
		sel = window.getSelection();
		sel.removeAllRanges();
		if (rang) sel.addRange(rang);
		document.execCommand((isFont) ? "fontName": "fontSize", false, value);
	});
}

function checkFontAndSizeOfSelection() {
	var fonts = $(rang.startContainer).parents("font");
	var size;
	var face;

	var i;
	for (i = 0; i < fonts.length; i++) {
		if (size && face) break;
		if (!size && fonts[i].hasAttribute("size")) 
			{size = parseInt(fonts[i].getAttribute("size"));}
		if (!face && fonts[i].hasAttribute("face")) 
			{face = fonts[i].getAttribute("face");}
	}

	size = (size) ? size: 2;
	face = (face) ? face: "Arial";

	$(".change-fontsize").val(size);
	$(".change-font").val(face);
}

/* ********** text-styling functions (BELOW) ********** */



/* ********** display area (Posting body) functions (BELOW) ********** */

function displayAreaEventListener() {
	$(".display-block").mousedown(function() {
		var $da = $(".display-area");
		$da.attr("contenteditable", true);

		/* check if display-area is empty, and if it is empty,
		 *  assign text to "" since program cannot get position when empty.
		 */ 
		if (isNullOrWhiteSpace($da.text())) {
			$da.text("");
		}
	});
}

function isNullOrWhiteSpace(str) {
	if (typeof str === "undefined" || str == null) return true;

	return str.replace(/\s/g, "").length < 1;
}


/**************************Property Buttons******************************/
/* variables for Selection and Range Object to get the currently working area. */
var sel;
var rang;
/* Add properties (bold, italic, underline, strikethrough) to selected texts or
 *  selected point on click or on command (command is built-in in many browsers).
 *  Properties' buttons must indicate when selected point/texts already have
 *  that properties. */
function propertiesButtonInit() {
	var parStyle = [{name: "insertUnorderedList"},
					{name: "indent"},
					{name: "outdent"}];

	var general = [{name: "bold", 			tags:["b", "strong"]},
				   {name: "underline",		tags:["u"]},
				   {name: "italic",			tags:["i", "em"]},
				   {name: "strikethrough", 	tags: ["strike"]}];

	var alignment = [{name: "justifyLeft",		tags:["left"]},
					 {name: "justifyCenter",	tags:["center"]},
					 {name: "justifyRight",		tags:["right"]},
					 {name: "justifyFull",		tags:["justify"]}];

	addBtnEventTrigger(parStyle, 0);
	addBtnEventTrigger(general, 1);
	addBtnEventTrigger(alignment, 2);

	var $displayArea = $(".display-area");
	$displayArea.mouseup(function() {
		updateSelectionAndRange();
		checkIfPropertyApplied(general, "words");
		checkIfPropertyApplied(alignment, "alignment");
		checkFontAndSizeOfSelection();
	});

	$displayArea.keyup(function() {
		updateSelectionAndRange();
		checkIfPropertyApplied(general, "words");
		checkIfPropertyApplied(alignment, "alignment");
		checkFontAndSizeOfSelection();
	});

	$displayArea.focusout(function() {
		$(".text-style-block button").removeClass("active");
	});
}

/* Add button's event trigger using given array and type.
 *  Array will contain name of class and command for execCommand.
 *  Type will be one of three types. 
 *   0: only execute execCommand (0 more lines to execute other than execCommand)
 *   1: execute toggleClass, too (1 more line to execute other than execCommand)
 *   2: execute removeClass, too (2 more lines to execute other than execCommand) */
function addBtnEventTrigger(arr, type) {
	arr.forEach(function(btn) {
		var $button = $("button." + btn.name);
		$button.mousedown(function(e) {
			e.preventDefault();
		});

		$button.click(function() {
			document.execCommand(btn.name);
			if (type === 2) {
				$(".paragraph-style .active").removeClass("active");
			}
			if (type > 0) {
				$(this).toggleClass("active");
			}
		});
	});
}

function updateSelectionAndRange() {
	sel = window.getSelection();
	if (sel.rangeCount) {
		rang = sel.getRangeAt(0);
	}
}

function checkIfPropertyApplied(properties, type) {
	properties.forEach(function(btn) {
		isPropertyApplied(btn.name, btn.tags, type);
	});
}

function isPropertyApplied(property, tags, type) {
	var isApplied = tags.map(function(tag) {
		var bit;
		switch(type) {
			case "words":
				bit = $(rang.startContainer).parents(tag).length;
				break;
			default:
				bit = isAlignmentApplied(property, tag);
		}
		return bit;
	});
	isApplied = isApplied.reduce((a,b) => a + b);
	var $button = $("button." + property);
	if (isApplied) {
		$button.addClass("active");
	} else {
		$button.removeClass("active");
	}
}

/************************************************************************/
/********************* Paragraph Alignment Buttons **********************/

function isAlignmentApplied(property, tag) {
	var divs = Object.values($(rang.startContainer).parents("div"));
	divs = divs.slice(0, divs.length - 2);
	var filteredDiv = divs.filter(function(ele, i) {
		var align = ele.style.textAlign || ele.getAttribute("align");
		return (align) ? true: false;
	});

	var isApplied = filteredDiv.map(function(par) {
		var align = par.style.textAlign || par.getAttribute("align");
		return (align === tag) ? 1: 0;
	}).reduce((a,b) => a + b, 0);

	return isApplied;
}

/************************************************************************/

/**************************** Color Buttons *****************************/

// True if user clicks on display-block or on "choose" button.
var isInDisplay = false;

function fontAndBgColor() {

	//add spectrum to both text-color and background-color selection.
	addSpectrum("#txt-spectrum");
	addSpectrum("#bg-spectrum");

	// Toggle views of color-picker(spectrum) when clicking on buttons.
	$(".glyphicon-text-color").click(function(e) {
		e.preventDefault();
		$("#txt-spectrum").toggle();
		$("#bg-spectrum").hide();
	});

	$(".glyphicon-text-background").click(function(e) {
		e.preventDefault();
		$("#bg-spectrum").toggle();
		$("#txt-spectrum").hide();
	});

	/* When clicking on "choose" button of spectrum, assign isInDisplay to true. 
	 *  Then, hide color-picker (color is changing automatically 
	 *  by spectrum's change event). */
	$("#txt-spectrum button.sp-choose").click(function(e) {
		e.preventDefault();
		hideWhenClickOutOfSpectrum(e, "#txt-spectrum");
	});

	$("#bg-spectrum button.sp-choose").click(function(e) {
		e.preventDefault();
		hideWhenClickOutOfSpectrum(e, "#bg-spectrum");
	});

	/* Update isInDisplay, change font/bg color and hide spectrum. */
	$(document).mouseup(function(e) {
		if ($("#txt-spectrum").css("display") !== "none") {
			hideWhenClickOutOfSpectrum(e, "#txt-spectrum");
		} else if ($("#bg-spectrum").css("display") !== "none") {
			hideWhenClickOutOfSpectrum(e, "#bg-spectrum");
		} else {
			isInDisplay = false;
		}
	});
}

/* Helper function that updates isInDisplay value which indicates whether
 *  spectrum's change event changes color or not. 
 *  isInDisplay is true iff display-block or "choose" button is clicked.
 *  Then, hide spectrum (color-picker).
 *  (spectrum won't be hidden when...
 *    - spectrum is already hidden
 *    - text-color/text-background button is clicked (see click event for these buttons)
 *    - spectrum itself is clicked)  
 */
function hideWhenClickOutOfSpectrum(e, id) {
	var hasTarget = $(".display-block").has(e.target).length > 0;
	var isTarget = $(".display-block").is(e.target);
	var isChosen = $("button.sp-choose").is(e.target);

	isInDisplay = (hasTarget || isTarget || isChosen) ? true: false;

	var $spectrum = $(id);
	var btn = (id === "#txt-spectrum") ? 
				".glyphicon-text-color": ".glyphicon-text-background";
	if (($spectrum.css("display") !== "none" &&
		!$(btn).is(e.target) &&
		!$spectrum.is(e.target) &&
		$spectrum.has(e.target).length === 0) || isChosen) {

		$spectrum.hide();
	}
}

/* Add spectrum (with change event function) to element with given id. */
function addSpectrum(id) {
	$(id + " > input").spectrum({
		color: "black",
		flat: true,
		cancelText: "reset",
		/* change event will change font/bg color automatically whenever 
		 * clicked outside of spectrum */
		change: function(color) {
			/* Change color iff display-block or "choose" button is clicked. */
			if (isInDisplay) {
				var command = (id === "#txt-spectrum") ? "foreColor": "backColor";
				sel = window.getSelection();
				sel.removeAllRanges();
				if (rang) sel.addRange(rang);
				document.execCommand(command, false, color.toHexString());
			}
		}
	});
}



/************************************************************************/

/* ********** display area (Posting body) functions (ABOVE) ********** */
