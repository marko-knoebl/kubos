"use strict";

// gui helper functions for Kubos
var addToolButton, createInputField;
(function() {
	addToolButton = function(tool) {
		var newButton;
		newButton = createButton(tool.name);
		setStyle(newButton, {
			width: '58px', height: '58px', fontSize: '12'});
		newButton.onclick = function() {activateTool(tool);};
		gui.toolSelector.appendChild(newButton);
	}

	createInputField = function(type, default_, onchange) {
		var inputField = document.createElement('input');
		inputField.type = type;
		inputField.setAttribute('value', default_);
		setStyle(inputField, {
			borderWidth: '1px', borderStyle: 'solid', margin: '3px', width: '80px'});
		if (onchange) {
			inputField.onchange = onchange;
		}
		return inputField;
	};
})();

// this object represents the geometric model that is being edited
var geoDoc;
(function() {
	geoDoc = {}
	// all geometric objects
	geoDoc.objects = [];

	geoDoc.add = function(obj) {
		// add an object to the document and update the view accordingly
		this.objects.push(obj);
		scene.add(obj);
		renderer.render(scene, camera);
	};

	geoDoc.rem = function(obj) {
		var index = this.objects.indexOf(obj);
		var toRemove = this.objects.splice(index, 1)[0];
		scene.remove(toRemove);
		renderer.render(scene, camera);
	};
})();

var lmbdown = false; // left mouse button down

var gui = {};
// initialize gui elements (default)
(function() {
	// set the document style (CSS)
	setStyle(document.body, {
		margin: 0,
		backgroundColor: '#eeeeee',
		fontFamily: 'Arimo, "Liberation Sans", Arial, Helvetica, sans-serif',
		fontSize: '16',
		cursor: 'default'});
}());

// create renderer
var renderer;
(function() {
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0xf6f6f6, 1);
	renderer.setSize(window.innerWidth - 200, window.innerHeight);
	renderer.domElement.style.cssFloat = 'right';
	renderer.domElement.style.width = window.innerWidth - 200;
	renderer.domElement.style.height = window.innerHeight;
	document.body.appendChild( renderer.domElement );
})();

// set up 3d view
var scene, camera, cameraContainer, renderer, render;
(function() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
	    50,
	    renderer.domElement.clientWidth / renderer.domElement.clientHeight,
	    0.1,
	    1000
	);

	// set up the camera so the z-axis is vertical
	camera.rotation.order = 'ZYX';
	camera.rotation.set(Math.PI/2, 0, Math.PI/2);

	// make a container for the newly oriented camera to control its orientation
	cameraContainer = new THREE.Object3D();
	cameraContainer.add(camera);
	cameraContainer.position.set(20, 0, 0);
	cameraContainer.rotation.order = 'ZYX';
	cameraContainer.ang = {'_phi': 0, '_theta': 0};
	Object.defineProperty(cameraContainer.ang, 'phi',
	    {
			get: function() {return cameraContainer.ang._phi;},
			set: function(phi_) {
				var theta_
				cameraContainer.ang._phi = phi_;
				theta_ = cameraContainer.ang._theta;
				cameraContainer._update();
			}
		}
	);
	Object.defineProperty(cameraContainer.ang, 'theta',
	    {
			get: function() {return cameraContainer.ang._theta;},
			set: function(theta_) {
				var phi_
				cameraContainer.ang._theta = theta_;
				phi_ = cameraContainer.ang._phi;
				cameraContainer._update();
			}
		}
	);
	cameraContainer._distance = 20;
	Object.defineProperty(cameraContainer, 'distance', {
		get: function() {return cameraContainer._distance;},
		set: function(distance) {
			cameraContainer._distance = Math.max(distance, 10);
			cameraContainer._update();
		}
	});

	cameraContainer._update = function() {
		cameraContainer.rotation.set(0, -cameraContainer.ang._theta, cameraContainer.ang._phi);
		cameraContainer.position.set(
			cameraContainer._distance * Math.cos(cameraContainer.ang._phi) * Math.cos(cameraContainer.ang._theta),
			cameraContainer._distance * Math.sin(cameraContainer.ang._phi) * Math.cos(cameraContainer.ang._theta),
			cameraContainer._distance * Math.sin(cameraContainer.ang._theta)
		);
	};

	cameraContainer.ang.phi = Math.PI/12;
	cameraContainer.ang.theta = Math.PI/8;
	scene.add(cameraContainer);

	// create grid
	var gridGeom;
	gridGeom = new THREE.Geometry();
	var gridMat = new THREE.LineBasicMaterial({color: 0xdddddd, shading: THREE.FlatShading});
	var i;
	var lineGeom, line;
	for (i = -10; i <= 10; i++) {
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(i, -10, 0));
		lineGeom.vertices.push(new THREE.Vector3(i, 10, 0));
		line = new THREE.Line(lineGeom, gridMat);
		scene.add(line);
	}
	for (i = -10; i <= 10; i++) {
		lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(-10, i, 0));
		lineGeom.vertices.push(new THREE.Vector3(10, i, 0));
		line = new THREE.Line(lineGeom, gridMat);
		scene.add(line);
	}

	// create axes
	var xAxis, yAxis, zAxis;
	xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xaa0000, 0.4, 0.3);
	yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x00aa00, 0.4, 0.3);
	zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x0000aa, 0.4, 0.3);
	xAxis.line.material.linewidth = 2.5;
	yAxis.line.material.linewidth = 2.5;
	zAxis.line.material.linewidth = 2.5;
	scene.add(xAxis);
	scene.add(yAxis);
	scene.add(zAxis);

	var light
	var positions = [[1, 1.4, 1.2], [-1, -1.2, 1.5]];
	for (var i = 0; i < 2; i++) {
		light = new THREE.DirectionalLight(0xffffff, 0.9);
		light.position.set(positions[i][0], positions[i][1], positions[i][2]);
		scene.add(light);
	}

	var ambientLight = new THREE.AmbientLight(0x505050);
	scene.add(ambientLight);
})();

var previewMaterial = new THREE.MeshPhongMaterial({
    color: 0x0099ee,
    shading: THREE.FlatShading,
    ambient: 0x0022ee,
    transparent: true,
    opacity: 0.5
});
var mainMaterial = new THREE.MeshPhongMaterial({color: 0x0099ee, shading: THREE.FlatShading, ambient: 0x0022ee});

// set up ray picker
var projector = new THREE.Projector();

var currentInput = {};

var preview;

window.addEventListener(
	'resize',
	function(event) {
		// update aspect ratios and size of the viewer
		camera.aspect = (window.innerWidth - 200) / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize((window.innerWidth - 200), window.innerHeight);
		renderer.render(scene, camera);
		},
	false
);

// location where the current mouse drag started
var mouseDragStart = {x:0, y:0, z:0};
// location of the last mouse position during the current drag
var mouseDragLast = {x:0, y:0, z:0};

var mouse2D = new THREE.Vector3(1, 1, 1);

document.addEventListener(
	'mousedown',
	function(event) {
		mousemoved = false;
		// store the normalized mouse position
		mouseDragLast.x = mouse2D.x;
		mouseDragLast.y = mouse2D.y;
		mouseDragStart.x = mouse2D.x;
		mouseDragStart.y = mouse2D.y;
		if (event.button === 0) {
			lmbdown = true;
		}
	},
	false
);

// track whether the mouse was moved after the last mousedown to track clicks
var mousemoved = false;

renderer.domElement.addEventListener(
	'mousemove',
	function(event) {
		mousemoved = true;
		mouse2D.x = ((event.clientX - 200) / renderer.domElement.width) * 2 - 1;
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

renderer.domElement.addEventListener(
	'wheel',
	function(event) {
		cameraContainer.distance += event.deltaY/1;
		renderer.render(scene, camera); // TODO: move into cameraContainer?
	}
);

document.addEventListener(
	'mouseup',
	function(event) {
		if (event.button === 0) {
			lmbdown = false;
		}
	},
	false
);

// from Javascript: the Definitve Guide, ed 6: 14.6
window.onerror = function(msg, url, line) {
	if (onerror.num++ < onerror.max) {
		alert('ERROR: ' + msg + '\n' + url + ':' + line);
		return true;
	}
};
onerror.max = 3;
onerror.num = 0;

loadScript('lib/THREE2STL.js');

(function() {
    // banner and contact info
    gui.kubosInfo = document.createElement('div');
    setStyle(gui.kubosInfo, {
       position: 'absolute',
       bottom: 0,
       left: 0,
       width: 200,
       backgroundColor: '#dddddd'
    });
    var banner = document.createElement('img');
    setStyle(banner, {
        width: 180,
        padding: 10,
        textAlign: 'center',
    })
    banner.src = './icons/r-y-b_tango_banner_vector.svg';
    var text = document.createElement('div');
    text.innerHTML = (
        'By <em><a href=http://markoknoebl.pythonanywhere.com/ target="_blank">' +
        'Marko "Karuga" Knöbl</a></em><br>' +
        '<a href=mailto:marko.kn@gmail.com target="_blank">Hire me</a>.'
    );
    setStyle(text, {
        padding: 6,
        fontSize: 12,
        textAlign: 'center',
    })
    gui.kubosInfo.appendChild(banner);
    gui.kubosInfo.appendChild(text);
    document.body.appendChild(gui.kubosInfo);
})();

(function() {
	// export button
	gui.printButton = document.createElement('div');
	setStyle(gui.printButton, {
        position: 'absolute',
        bottom: 190,
        left: 0,
        width: 200,
        textAlign: 'center'
	});

	gui.printIcon = document.createElement('img');
	gui.printIcon.src = './icons/printer-symbolic.svg';
	gui.printIcon.alt = 'Print';
    setStyle(gui.printIcon, {
        width: 80,
    });
	gui.printButton.appendChild(gui.printIcon);

    gui.printButtonText = document.createElement('div');
    gui.printButtonText.innerHTML = '3D-Print Model <div style="font-size:12">(publish on Shapeways)</div>';
	gui.printButton.appendChild(gui.printButtonText);

	gui.printButton.addEventListener(
		'mousedown',
		function(event) {
		    var objects = geoDoc.objects.slice();
			var result = new ThreeBSP(objects.shift());
			objects.forEach(
				function(object) {
					var bsp1 = new ThreeBSP(object);
					result = result.union(bsp1);
				}
			);
			result = result.toMesh();
			result.material = mainMaterial;
			var m = new THREE.Matrix4();
			m.makeScale(0.003, 0.003, 0.003);
			result.geometry.applyMatrix(m);
			var stlString = stlFromGeometry(result.geometry);
			console.log(stlString);
			// source for "post" is in boxes.js

            var shop_url = 'https://www.shapeways.com/shops/marko_knoebl?sort=newest'

			$.ajax({
                type: "POST",
                url: "/upload_stl",
                data: {
                    stl_string:stlString
                }
            }).success( function(msg, second, jqxhr) {
                show_print_link(JSON.parse(msg).model_url)
            }).fail( function( xmlHttpRequest, statusText, errorThrown ) {
              alert(
                "Your form submission failed.\n\n"
                  + "XML Http Request: " + JSON.stringify( xmlHttpRequest )
                  + ",\nStatus Text: " + statusText
                  + ",\nError Thrown: " + errorThrown );
            });
		},
		false
	);
	document.body.appendChild(gui.printButton);
})();

var show_print_link = function(link) {
    var link_box = document.createElement('div');
    setStyle(link_box, {
		position: 'absolute',
		width: 500,
		height: 100,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: 16,
		backgroundColor: '#ffffff',
		textAlign: 'center'
	});
	var link_el = document.createElement('a');
	link_el.href = link;
	link_el.innerHTML = link;
	link_el.target = '_blank';
	link_el.addEventListener(
		'mousedown',
		function() {
			//window.open(link, '_blank');
			setTimeout(
			    function() {
			        document.body.removeChild(link_box);
			    }, 500
			);
		}
	);
	link_box.innerHTML = (
		'The model has been uploaded to the Shapeways printing service.<br>' +
		'It will take about a minute until it is ready to print.<br><br>'
	);
	link_box.appendChild(link_el);
	document.body.appendChild(link_box);
};

renderer.render(scene, camera);
