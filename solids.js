// initialize gui elements (overridden)
(function() {
	// set the document style (CSS)
	setStyle(document.body, {
		'margin': '0px', 'backgroundColor': '#eeeeee', 'fontFamily': 'Arimo, "Liberation Sans", Arial, Helvetica, sans-serif',
		'fontSize': '16', 'cursor': 'default'}
	);

	// vertical split
	//gui.leftSidebar = document.createElement('div');
	//setStyle(gui.leftSidebar, {
	//	'cssFloat': 'left', 'width': '200px', 'backgroundColor': '#ffffff'}
	//);
	//document.body.appendChild(gui.leftSidebar);

	gui.toolSelector = document.createElement('div');
	gui.toolSelector.id = 'toolSelector';
	gui.toolSelector.style.backgroundColor = '#ffffff';
	gui.toolSelector.style.margin = '3px';
	gui.leftSidebar.appendChild(gui.toolSelector);

	gui.toolOptionsContainer = document.createElement('div');
	gui.toolOptionsContainer.id = 'toolOptionsContainer';
	gui.leftSidebar.appendChild(gui.toolOptionsContainer);
	gui.toolOptions = document.createElement('div');
	gui.toolOptions.style.backgroundColor = '#eeeeee';
	gui.toolOptions.style.fontSize = '12';
	//gui.toolOptions.style.padding = '10px';
	gui.toolOptionsContainer.appendChild(gui.toolOptions);
	gui.toolButtons = document.createElement('div');
	gui.toolButtons.style.textAlign = 'center';
	gui.toolButtons.style.padding = '6px';
	gui.toolButtons.style.backgroundColor = '#eeeeee';
	var addButton = createButton(
		'Add',
		function() {
			var newObject = preview.clone();
			newObject.material = mainMaterial;
			geoDoc.add(newObject);
			activateTool(selectTool);
		}
	);
	gui.toolButtons.appendChild(addButton);
	var cancelButton = createButton(
		'Cancel',
		function() {
			activateTool(selectTool);
		}
	);
	gui.toolButtons.appendChild(cancelButton);
	gui.toolOptionsContainer.appendChild(gui.toolButtons);

	gui.objectDetailsContainer = document.createElement('div');
	gui.objectDetailsContainer.style.display = 'none';
	gui.leftSidebar.appendChild(gui.objectDetailsContainer);

	gui.objectDetails = document.createElement('div');
	gui.objectDetails.style.backgroundColor = '#eeeeee';
	gui.objectDetails.style.fontSize = '12';
	//gui.objectDetails.style.padding = '10px';
	gui.objectDetailsContainer.appendChild(gui.objectDetails);

	gui.booleanContainer = document.createElement('div');
	gui.booleanContainer.style.backgroundColor = '#eeeeee';
	gui.booleanContainer.style.display = 'none';
	gui.booleanContainer.style.padding = '0px';
	gui.leftSidebar.appendChild(gui.booleanContainer);

	gui.booleans = document.createElement('div');
	gui.booleans.style.margin = '0px';
	gui.booleanContainer.appendChild(gui.booleans);

	var intButton = createButton(
		'Intersection',
		function() {
			var bsp0 = new ThreeBSP(selectedObjects[0]);
			var bsp1 = new ThreeBSP(selectedObjects[1]);
			var res = bsp0.intersect(bsp1).toMesh();
			res.material = mainMaterial;
			geoDoc.add(res);
			renderer.render(scene, camera);
		}
	);
	intButton.style.width = '78px';
	intButton.style.display = 'block';
	intButton.style.margin = '6px';
	gui.booleans.appendChild(intButton);
	var uniButton = createButton(
		'Union',
		function() {
			var bsp0 = new ThreeBSP(selectedObjects[0]);
			var bsp1 = new ThreeBSP(selectedObjects[1]);
			var res = bsp0.union(bsp1).toMesh();
			res.material = mainMaterial;
			geoDoc.add(res);
			renderer.render(scene, camera);
		}
	);
	uniButton.style.width = '78px';
	uniButton.style.display = 'block';
	uniButton.style.margin = '6px';
	gui.booleans.appendChild(uniButton);
	var diffButton = createButton(
		'Difference',
		function() {
			var bsp0 = new ThreeBSP(selectedObjects[0]);
			var bsp1 = new ThreeBSP(selectedObjects[1]);
			var res = bsp0.subtract(bsp1).toMesh();
			res.material = mainMaterial;
			geoDoc.add(res);
			renderer.render(scene, camera);
		}
	);
	diffButton.style.width = '78px';
	diffButton.style.display = 'block';
	diffButton.style.margin = '6px';
	gui.booleans.appendChild(diffButton);

	gui.devArea = document.createElement('div');
	//gui.leftSidebar.appendChild(gui.devArea);
})();

var selectedObjects = [];

// define tools
var Tool, boxTool, sphereTool, cylinderTool, coneTool, torusTool, pyramidTool, icosahedronTool, selectTool;
(function() {
	Tool = function(name, inputs, getShape) {
		this.name = name;
		this.inputs = inputs;
		this.getShape = getShape;
	}
	Tool.prototype = new Object(); // This could be left out

	boxTool = new Tool(
		'Box',
		{Depth: 1, Width: 1, Height: 1},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.BoxGeometry(currentInput.Depth, currentInput.Width, currentInput.Height),
				previewMaterial
			);
			newObj.position.set(currentInput.Depth/2, currentInput.Width/2, currentInput.Height/2);
			return newObj;
		}
	);

	sphereTool = new Tool(
		'Sphere',
		{Radius: 1},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.SphereGeometry(currentInput.Radius, 24, 18),
				previewMaterial
			);
			newObj.rotation.x = Math.PI/2;
			return newObj;
		}
	);

	cylinderTool = new Tool(
		'Cylinder',
		{Radius: 1, Height: 1},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.CylinderGeometry(currentInput.Radius, currentInput.Radius, currentInput.Height, 24),
				previewMaterial
			);
			newObj.rotation.x = Math.PI/2
			newObj.position.z = currentInput.Height/2;
			return newObj;
		}
	);

	coneTool = new Tool(
		'Cone',
		{'Bottom Radius': 1, 'Top Radius': 0, Height: 1},
		function() {
			var newObj = new THREE.Mesh(
				// TODO: having a radius of 0 will cause problems with boolean operations. Use this workaround for now
				new THREE.CylinderGeometry(currentInput['Top Radius'] || 0.00001, currentInput['Bottom Radius'] || 0.00001, currentInput.Height, 24, true),
				previewMaterial
			);
			newObj.rotation.x = Math.PI/2
			newObj.position.z = currentInput.Height/2;
			return newObj;
		}
	);

	torusTool = new Tool(
		'Torus',
		{'Primary Radius': 2, 'Secondary Radius': 1},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.TorusGeometry(currentInput['Primary Radius'], currentInput['Secondary Radius'], 24, 24),
				previewMaterial
			);
			return newObj;
		}
	);

	pyramidTool = new Tool(
		'Pyramid',
		{'Height': 1, 'Radius': 1, 'Sides': 4},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.CylinderGeometry(0.00001, currentInput['Radius'], currentInput['Height'], currentInput['Sides'], false),
				previewMaterial
			);
			newObj.rotation.x = Math.PI/2;
			newObj.position.z = currentInput.Height/2;
			return newObj;
		}
	);

	icosahedronTool = new Tool(
		'Icosah.',
		{Radius: 1,},
		function() {
			var newObj = new THREE.Mesh(
				new THREE.IcosahedronGeometry(currentInput.Radius),
				previewMaterial
			);
			return newObj;
		}
	);

	selectTool = new Tool(
		'Select',
		{},
		function() {return new THREE.Mesh(new THREE.Geometry(), new THREE.Material())}
	);
})();

addToolButton(boxTool);
addToolButton(sphereTool);
addToolButton(cylinderTool);
addToolButton(coneTool);
addToolButton(torusTool);
addToolButton(pyramidTool);
addToolButton(icosahedronTool);

var activeTool;

var onInputChange = function() {
	// update the preview
	scene.remove(preview);
	preview = activeTool.getShape();
	scene.add(preview);
	renderer.render(scene, camera);
};

var onchangeFactory = function(inputName) {
	// create afunction that is to be called when the user changes an input
	return function() {
		currentInput[inputName] = parseFloat(this.value);
		onInputChange();
	};
};

var activateTool = function(tool) {
	activeTool = tool;

	// deselect all objects
	selectedObjects.forEach(
		function(element) {
			element.material = mainMaterial;
		}
	);
	selectedObjects = [];
	onSelectionChanged(); // TODO: call this automatically

	// remove all inputs
	while (gui.toolOptions.firstChild) {
		gui.toolOptions.removeChild(gui.toolOptions.firstChild);
	}

	if (tool.name !== 'Select') {
		gui.toolOptions.innerHTML = '<p style="font-size:18px">' + tool.name + ':</p>';
	} else {
		gui.toolOptions.innerHTML = '';
	}
	for (var inputName in tool.inputs) {
		if (tool.inputs.hasOwnProperty(inputName)) {
			var label = document.createElement('div');
			label.innerHTML = inputName;
			gui.toolOptions.appendChild(label);
			currentInput[inputName] = parseFloat(tool.inputs[inputName]);
			gui.toolOptions.appendChild(
				createInputField('number', tool.inputs[inputName], onchangeFactory(inputName))
			);
		}
	}
	if (tool === selectTool) {
		gui.toolButtons.style.display = 'none';
	} else {
		gui.toolButtons.style.display = 'block';
	}
	onInputChange();
}

var originalPosition = {x: 0, y: 0, z: 0};

var makeTranslateHandler = function(name) {
	return function() {
		var self = this;
		selectedObjects.forEach(function(obj) {
			obj.position[name] = originalPosition[name] + parseFloat(self.value);
		});
		renderer.render(scene, camera);
	};
};

var originalRotation = {x: 0, y: 0, z:0};

var makeRotateHandler = function(name) {
	return function() {
		var self = this;
		selectedObjects.forEach(function(obj) {
			obj.rotation[name] = (originalRotation[name] + parseFloat(self.value)) / 180 * Math.PI;
		});
		renderer.render(scene, camera);
	};
};

var onSelectionChanged = function() {
	if (selectedObjects.length === 0) {
		gui.objectDetailsContainer.style.display = 'none';
	} else {
		originalPosition.x = selectedObjects[0].position.x;
		originalPosition.y = selectedObjects[0].position.y;
		originalPosition.z = selectedObjects[0].position.z;
		originalRotation.x = selectedObjects[0].rotation.x;
		originalRotation.y = selectedObjects[0].rotation.y;
		originalRotation.z = selectedObjects[0].rotation.z;
		gui.objectDetailsContainer.style.display = 'block';

		// remove all inputs
		while (gui.objectDetails.firstChild) {
			gui.objectDetails.removeChild(gui.objectDetails.firstChild);
		}

		// create inputs to change location
		for (var i = 0; i < 3; i++) {
			var name = ['x', 'y', 'z'][i];
			var label = document.createElement('div');
			label.innerHTML = name;

			gui.objectDetails.appendChild(label);

			var fn = makeTranslateHandler(name);

			var inputField = createInputField(
				'number',
				0,
				fn
			);
			gui.objectDetails.appendChild(inputField);
		}

		// select rotation axis
		gui.objectDetails.innerHTML += '<br>Rotate:<br>';

		['x', 'y', 'z'].forEach( function(axis) {
			//gui.objectDetails.innerHTML += '<br>';
			var inputField = document.createElement('input');
			inputField.type = 'radio';
			inputField.value = 'xyy';
			inputField.name = 'axis_rotation';
			//inputField.checked = 'true';
			inputField.style.width = '20';
			gui.objectDetails[axis] = inputField;
			gui.objectDetails.appendChild(inputField);
			//gui.objectDetails.innerHTML += axis;
		});
		//gui.objectDetails.x.checked = true;

		var anglelbl = document.createElement('div');
		anglelbl.innerHTML = 'Angle';
		gui.objectDetails.appendChild(anglelbl);
		var inputField = createInputField('number', 0,
			function() {
				if (gui.objectDetails.x.checked) {
					var ax = 'x';
				} else if (gui.objectDetails.y.checked) {
					var ax = 'y';
				} else {
					var ax = 'z';
				};
				selectedObjects[0].rotation[ax] += 0.1;
				renderer.render(scene, camera);
			}
		);
		gui.objectDetails.appendChild(inputField);

	}
	if (selectedObjects.length >= 2) {
		gui.booleanContainer.style.display = 'block';
	} else {
		gui.booleanContainer.style.display = 'none';
	}
	renderer.render(scene, camera);
};

renderer.domElement.addEventListener(
	'mouseup',
	function(event) {
		if (event.button === 0) {
			lmbdown = false;
			var distanceMoved = Math.sqrt(Math.pow(mouseDragStart.x - mouse2D.x, 2) + Math.pow(mouseDragStart.y - mouse2D.y, 2));
			if (distanceMoved < 1/50) {
				// the user has not moved the mouse by more than 1/50 of the screen width
				if (activeTool === selectTool) {
					var ray = projector.pickingRay(mouse2D, camera);
					var intersects = ray.intersectObjects(geoDoc.objects);

					if (intersects.length === 0) {
						// user did not click on an object - deselect all objects)
						selectedObjects.forEach(
							function(obj) {
								obj.material = mainMaterial;
							}
						);
						selectedObjects = [];
					} else {
						// user clicked on an object
						var idx = selectedObjects.indexOf(intersects[0].object)
						if (idx === -1) {
							// was not selected before
							selectedObjects.push(intersects[0].object);
							intersects[0].object.material = previewMaterial;
						} else {
							// was selected before
							selectedObjects.splice(idx, 1);
							intersects[0].object.material = mainMaterial;
						}
					}
					onSelectionChanged();
				}
			}
		}
	},
	false
);

renderer.domElement.addEventListener(
	'mousemove',
	function(event) {
		mousemoved = true;
		mouse2D.x = ((event.clientX-200) / renderer.domElement.width) * 2 - 1;
		mouse2D.y = - (event.clientY / renderer.domElement.height) * 2 + 1;
		var dx, dy;
		dx = mouse2D.x - mouseDragLast.x;
		dy = mouse2D.y - mouseDragLast.y;
		mouseDragLast.x = mouse2D.x;
		mouseDragLast.y = mouse2D.y;
		if (!lmbdown) {
			return;
		}
		cameraContainer.ang.phi -= dx * 150/180*Math.PI;
		cameraContainer.ang.theta -= dy * 150/180*Math.PI;
		renderer.render(scene, camera);
	},
	false
);

document.addEventListener(
	'keydown',
	function(event) {
		if (event.which === 46) {
			// del key
			selectedObjects.forEach( function(element, index) {
				geoDoc.rem(element);
				delete selectedObjects[index];
			});
			// remove undefined values
			selectedObjects = selectedObjects.filter(function(element){ return element !== undefined });
			onSelectionChanged();
		} else if (event.which === 27) {
			// esc key
			activateTool(selectTool);
			// deselect all objects
			selectedObjects.forEach( function(element) {element.material = mainMaterial});
			selectedObjects = [];
			onSelectionChanged();
		}
	},
	false
);
