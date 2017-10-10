(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// module for navbar settings
/* Setup navigation interaction features. (export it) */
function navSettings() {
    // menu-popper is for showing navigation that has been hidden. Hide this initally.
    $(".menu-popper").hide();

    // disable bootstrap's default click event which changes background-color of button.
    $("#menu-up").click(function () {
        // override bootstrap's change of background-color with navbar's color.
        $(this).css({ "background-color": "#222" });
    });

    // indicator to check if navbar is opened (event for when navbar is collapsed)
    var isNavbarOpened = false;
    var $navbarMenu = $("#navbar-toggle");
    // change background-color of menu button according to indicator.
    $navbarMenu.click(function () {
        var menuBgColor = $(this).css("background-color");
        if (isNavbarOpened) {
            $(this).css({ "background-color": "rgb(34, 34, 34)" });
        } else {
            $(this).css({ "background-color": "rgb(51, 51, 51)" });
        }
        isNavbarOpened = !isNavbarOpened;
    });

    // change background-color of menu button according to indicator
    $navbarMenu.hover(function () {
        $(this).css({ "background-color": "rgb(51, 51, 51)" });
    }, function () {
        if (!isNavbarOpened) {
            $(this).css({ "background-color": "rgb(34, 34, 34)" });
        }
    });

    // toggle navbar when clicking menu-up/down button.
    $(".menu-toggle").click(function () {
        $(".menu-controller").toggle();
    });
}

exports.default = navSettings;
},{}],2:[function(require,module,exports){
"use strict";

var _navSettings = require("./navSettings.js");

var _navSettings2 = _interopRequireDefault(_navSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// javascript for registration.html
$(document).ready(function () {
	//setup navbar events
	(0, _navSettings2.default)();
});
},{"./navSettings.js":1}]},{},[2]);
