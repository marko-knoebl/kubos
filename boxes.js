(function() {
	// rem button
	gui.remButton = document.createElement('img');
	setStyle(gui.remButton,
		{position: 'absolute',
		top: 16,
		left: 48,
		width: 80,
		height: 80,
		}
	);
	gui.remButton.src = './icons/window-close-symbolic.svg';
	gui.remButton.alt = 'Remove';
	document.body.appendChild(gui.remButton);
})();

// the x-y-plane (not shown in the scene)
var xyplaneMat = new THREE.MeshBasicMaterial();
xyplaneMat.side = THREE.DoubleSide;
var xyplane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), xyplaneMat);

// box for previews
var prevBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({color: 0x444499, transparent: true, opacity: 0.5}));
// material for boxes
var mat = new THREE.MeshPhongMaterial({color: 0xff9999});

renderer.domElement.addEventListener(
	'mouseup',
	function(event) {
		if (event.button === 0) {
			lmbdown = false;
			var distanceMoved = Math.sqrt(Math.pow(mouseDragStart.x - mouse2D.x, 2) + Math.pow(mouseDragStart.y - mouse2D.y, 2));
			if (modeAdd && (distanceMoved < 1/50)) {
				// the user has not moved the mouse by more than 1/50 of the screen width
				var newBox = prevBox.clone();
				newBox.material = new THREE.MeshPhongMaterial({color: 0x444499});
				geoDoc.add(newBox);
				renderer.render(scene, camera);
			} else if (!modeAdd) {
				if (todelete !== null) {
					geoDoc.rem(todelete);
					renderer.render(scene, camera);
				}
			}
		}
	},
	false
);

var todelete = null;

renderer.domElement.addEventListener(
	'mousemove',
	function(event) {
		mouse2D.x = ((event.clientX - 200) / renderer.domElement.width) * 2 - 1;
		mouse2D.y = - (event.clientY / renderer.domElement.height) * 2 + 1;
		var dx, dy;
		dx = mouse2D.x - mouseDragLast.x;
		dy = mouse2D.y - mouseDragLast.y;
		if (lmbdown) {
			cameraContainer.ang.phi -= dx * 150/180*Math.PI;
			cameraContainer.ang.theta -= dy * 150/180*Math.PI;
			renderer.render(scene, camera);
		} else if (modeAdd) {
			var m = mouse2D.clone();
			ray = projector.pickingRay(m, camera);
			var intersects = ray.intersectObjects(geoDoc.objects);
			if (intersects.length === 0) {
				intersects = ray.intersectObjects([xyplane]);
			}
			if (intersects.length === 0) {
				scene.remove(prevBox);
				renderer.render(scene, camera);
				return;
			}
			var pnt = intersects[0].point;
			var x, y, z;
			// round down
			x = Math.floor(pnt.x + 1e-6);
			y = Math.floor(pnt.y + 1e-6);
			z = Math.floor(pnt.z + 1e-6);
			if (Math.abs(intersects[0].face.normal.x) < 1e-6) {
				prevBox.position.x = x + 0.5; //* Math.sign(intersects[0].face.normal.x);
			} else {
				prevBox.position.x = x + 0.5 * intersects[0].face.normal.x;
			}
			if (Math.abs(intersects[0].face.normal.y) < 1e-6) {
				prevBox.position.y = y + 0.5;
			} else {
				prevBox.position.y = y + 0.5 * intersects[0].face.normal.y;
			}
			if (Math.abs(intersects[0].face.normal.z) < 1e-6) {
				prevBox.position.z = z + 0.5;
			} else {
				prevBox.position.z = z + 0.5 * intersects[0].face.normal.z;
			}
			scene.add(prevBox);
			renderer.render(scene, camera);
		} else {
			var m = mouse2D.clone();
			var ray = projector.pickingRay(m, camera);
			var intersects = ray.intersectObjects(geoDoc.objects);
			if (intersects.length === 0) {
				todelete = null;
				return;
			}
			todelete = intersects[0].object;
		}
	},
	false
)

var modeAdd = true;
gui.remButton.addEventListener(
	'mouseup',
	function(event) {
		modeAdd = !modeAdd;
		if (modeAdd) {
			gui.remButton.src = './icons/window-close-symbolic.svg';
		} else {
			scene.remove(prevBox);
			renderer.render(scene, camera);
			gui.remButton.src = './icons/window-close-red-symbolic.svg';
		}
	},
	false
);

var post = function(path, params, method) {
	method = method || "post"; // Set method to post by default if not specified.

	// The rest of this code assumes you are not using a library.
	// It can be made less wordy if you use one.
	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for(var key in params) {
		if(params.hasOwnProperty(key)) {
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", key);
			hiddenField.setAttribute("value", params[key]);

			form.appendChild(hiddenField);
		 }
	}

	document.body.appendChild(form);
	form.submit();
}
