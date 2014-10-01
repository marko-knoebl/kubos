'use strict';

var setStyle = function(obj, style) {
	for (var prop in style) {
		if (style.hasOwnProperty(prop)) {
			obj.style[prop] = style[prop];
		}
	}
};