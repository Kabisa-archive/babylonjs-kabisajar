;( function( $, window, document, undefined ) {

	"use strict";

		var pluginName = "kabisaMugPreview",
			defaults = {
				width: 300,
			 	height: 300,
				'filename': 'test.babylon'
			};

		function Plugin ( element, options ) {
			this.element = element;

			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		$.extend( Plugin.prototype, {
			init: function() {
				this.canvas = $('<canvas />').appendTo(this.element);
				$(this.canvas).width(this.settings.width);
				$(this.canvas).height(this.settings.height);

				this.engine = new BABYLON.Engine($(this.canvas).get(0), true);

				this.engine.enableOfflineSupport = false;
				var canvas = $(this.canvas).get(0);
				var engine = this.engine;

				var scene = new BABYLON.Scene(engine);
				var exposure = 0.2;
				var contrast = 0.6;

				var hdrTexture = new BABYLON.HDRCubeTexture("textures/room.hdr", scene, 512);
				var seamlessTexture = new BABYLON.HDRCubeTexture("textures/room.hdr", scene, 64, false, true, false, true);

				// Create the glass material
				var glass = new BABYLON.PBRMaterial("glass", scene);
				glass.refractionTexture = hdrTexture;
				glass.linkRefractionWithTransparency = false;
				glass.indexOfRefraction = 0.8;
				glass.alpha = 0.33
				glass.cameraExposure = exposure;
				glass.cameraContrast = contrast;
				glass.microSurface = 1;
				glass.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2);
				glass.albedoColor = new BABYLON.Color3(0.85, 0.85, 0.85);

				// Create the wood material
				var wood = new BABYLON.PBRMaterial("wood", scene);
			  wood.reflectionTexture = hdrTexture;
			  wood.environmentIntensity = 1;
			  wood.specularIntensity = 0.3;
			  wood.cameraExposure = exposure;
			  wood.cameraContrast = contrast;
			  wood.reflectivityTexture = new BABYLON.Texture("textures/reflectivity.png", scene);
			  wood.useMicroSurfaceFromReflectivityMapAlpha = true;
			  wood.albedoColor = BABYLON.Color3.White();
			  wood.albedoTexture = new BABYLON.Texture("textures/albedo.png", scene);

				// Create the metal material
				var metal = new BABYLON.PBRMaterial("metal", scene);
				metal.reflectionTexture = seamlessTexture;
				metal.microSurface = 0.76;
				metal.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.1);
				metal.albedoColor = new BABYLON.Color3(0.05, 0.03, 0.01);
				metal.environmentIntensity = 0.85;
				metal.cameraExposure = 0.66;
				metal.cameraContrast = 1.66;

				// Create the red metal material
				var metalRed = new BABYLON.PBRMaterial("metalred", scene);
				metalRed.reflectivityColor = new BABYLON.Color3(0.3, 0.3, 0.3);
				metalRed.albedoColor = new BABYLON.Color3(1, 0, 0);
				metalRed.reflectionTexture = seamlessTexture;
				metalRed.microSurface = 0.76;
				metalRed.cameraExposure = 0.66;
				metalRed.cameraContrast = 1.66;

				// Create the silver metal material
				var metalSilver = new BABYLON.PBRMaterial("metal", scene);
				metalSilver.reflectionTexture = seamlessTexture;
				metalSilver.microSurface = 0.76;
				metalSilver.reflectivityColor = new BABYLON.Color3(0.6, 0.6, 0.6);
				metalSilver.albedoColor = new BABYLON.Color3(0.05, 0.03, 0.01);
				metalSilver.environmentIntensity = 0.85;
				metalSilver.cameraExposure = 0.66;
				metalSilver.cameraContrast = 1.66;

				// Create the cookie material
				var cookieMat = new BABYLON.StandardMaterial("cookieTexture", scene);
				cookieMat.diffuseTexture = new BABYLON.Texture("textures/cookie.jpg", scene);
				cookieMat.specularColor = new BABYLON.Color3(0, 0, 0);
				cookieMat.backFaceCulling = true;

				// Set the material properties so they can be accessed later
				this.gold = metal;
				this.cookie = cookieMat;
				this.red = metalRed;
				this.silver = metalSilver;
				this.glass = glass;

				// Set the scene up
				scene.clearColor = new BABYLON.Color3(1,1,1);

				// Create the camera
				var camera = new BABYLON.ArcRotateCamera("camera", 1, 0.8, 10, new BABYLON.Vector3(0,0,0), scene);

				// Enable the scene physics so balls will actually fall down
				scene.enablePhysics();

				// Make sure the camera we just created is the currently active camera.
				scene.activeCamera = camera;

				// Attacht the control of the camera to the scene
				// The second parameter makes sure it passes the scroll wheel action to the page
				scene.activeCamera.attachControl(canvas, true);

				// Fix the camera zoom
				scene.activeCamera.lowerRadiusLimit = scene.activeCamera.radius;
				scene.activeCamera.upperRadiusLimit = scene.activeCamera.radius;

				// Make sure the camera has the desired position
				scene.activeCamera.setPosition(new BABYLON.Vector3(7.24, 4.02, 5.59));


				// Enable the gravity and collisions
				scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
				scene.collisionsEnabled = true;

				// The scene lighting
				var light0 = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
				light0.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
				light0.specular = new BABYLON.Color3(0.3, 0.3, 0.3);
				light0.groundColor = new BABYLON.Color3(1, 1, 1);

				var light1 = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
				light1.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
				light1.specular = new BABYLON.Color3(0.3, 0.3, 0.3);
				light1.groundColor = new BABYLON.Color3(0, 0, 0);

				// Attach the light1 object to the camera so moving te camera also moves the light
				// This makes sure the object looks like it's being turned instead of the camera
				light1.parent = camera;

				// Create the basic model which consists of two cylinders
				// The bottom of the vase
				var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 0.3, 4.4, 4.4, 50, 1, scene, false);
				cylinder.material = wood;
				cylinder.position.y = -2.4;

				// The glass cone
				var glassCone = this.createHollowCone(scene, 5, 3.8, 4, 50, glass);

				// The decal is used to print the Kabisa logo on the vase
				var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
				decalMaterial.diffuseTexture = new BABYLON.Texture("textures/kabisa.png", scene);
				decalMaterial.diffuseTexture.hasAlpha = true;
				decalMaterial.zOffset = -2;

				var decalSize = new BABYLON.Vector3(1, 0.4, 1);
				var position = new BABYLON.Vector3(1.3, 1.8, 1.5);
				var normal = new BABYLON.Vector3(0.65, 0, 0.75);
				var newDecal = BABYLON.Mesh.CreateDecal("decal", glassCone, position, normal, decalSize);
				newDecal.material = decalMaterial;

				// Create the impostors on the cylinder and the cone so the balls will bounce of on them
				cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(cylinder, BABYLON.PhysicsImpostor.CylinderImpostor,
					{ mass: 0, restitution: 0 }, scene);

				cylinder.checkCollisions = true;
				glassCone.checkCollisions = true;

				glassCone.physicsImpostor = new BABYLON.PhysicsImpostor(glassCone, BABYLON.PhysicsImpostor.MeshImpostor,
					{ mass: 0, restitution: 0.2 }, scene);

				// This loop makes sure the scene is constantly rendered
				engine.runRenderLoop(function() {
					scene.render();
				});

				// Create an empty array to hold all the balls
				this.balls = [];

				// Set the object property to the scene
				this.scene = scene;

				// Attach a click event handler to the ball selector
				var plugin = this;
				$('#add-a-ball li').click(function() {
					plugin.createBall($(this).text().trim().toLowerCase());
				});

			},

			// This function creates a hollow cone
			createHollowCone: function(scene, height, innerDiameter, outerDiameter, tess, material) {

				var inner = BABYLON.Mesh.CreateCylinder("inner", height, innerDiameter, innerDiameter, tess, 1, scene);
				var outer = BABYLON.Mesh.CreateCylinder("outer", height, outerDiameter, outerDiameter, tess, 1, scene);

				var innerCSG = BABYLON.CSG.FromMesh(inner);
				var outerCSG = BABYLON.CSG.FromMesh(outer);

				var subCSG = outerCSG.subtract(innerCSG);

				var newMesh = subCSG.toMesh("csg2", material, scene);

				scene.removeMesh(inner);
				scene.removeMesh(outer);

				return newMesh;
			},

			// This function creates a ball and adds it to the scene
			createBall: function(materialName) {
				switch (materialName) {
					case 'gold':
						this.balls.push(this.createBallObject(this.scene, this.gold, 0));
						break;
					case 'red':
						this.balls.push(this.createBallObject(this.scene, this.red, 0));
						break;
					case 'silver':
						this.balls.push(this.createBallObject(this.scene, this.silver, 0));
						break;
					case 'glass':
						this.balls.push(this.createBallObject(this.scene, this.glass, 0));
						break;
					case 'cookie':
						this.balls.push(this.createBallObject(this.scene, this.cookie, 0));
						break;

				}
			},

			// This function creates the actual ball object
			createBallObject: function(scene, material, index) {

				var cookie = BABYLON.MeshBuilder.CreateSphere("cookie", {
						height: 0.1,
						diameter: 1,
						diameterBottom: 0.5,
						tessallation: 15,
						updatable: true}, scene);

				var randomx = Math.random() * (1 - -1) + -1;
				var randomy = Math.random() * (5 - -5) + -5;
				var randomz = Math.random() * (1 - -1) + -1;

				cookie.material = material;
				cookie.position.y = 2;
				cookie.position.x = randomx / 2;
				cookie.position.z = randomz / 2;
				cookie.updatePhysicsBody();

				cookie.physicsImpostor = new BABYLON.PhysicsImpostor(cookie, BABYLON.PhysicsImpostor.SphereImpostor,
					{ mass: 1, restitution: 0.1 }, scene);

				cookie.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0.1, 0), cookie.getAbsolutePosition());

				//cookie.ellipsoid = new BABYLON.Vector3(0, 0.3, 0);
				cookie.applyGravity = true;
				cookie.checkCollisions = 1;


				return cookie;

			}
		} );

		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
