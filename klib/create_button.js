
var createButton = function(text, onclick) {
	var button = document.createElement('button');
	setStyle(button, {
		'margin': '3px', 'border': '0px', 'height': '24px', 'width': '58px',
		'backgroundColor': '#1ba1e2', 'color': '#ffffff', 'fontSize': '12'});
	button.innerHTML = text;
	button.onclick = onclick;
	return button;
}