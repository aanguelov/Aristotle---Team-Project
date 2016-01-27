
var camera, scene, renderer;
var geometry, material, mesh;
var controls;
var objects = [];
var prev;
var raycaster;
var target;

var sideRays = [
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 0),
];

var botRay =  new THREE.Vector3(0, -1, 0);
var topRay = new THREE.Vector3(0, 1, 0);

var speed = 30;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var bogi;
var bankin;
var id;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var audio = document.createElement('audio');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

//pointer locking
if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controlsEnabled = true;
            controls.enabled = true;


            blocker.style.display = 'none';

        } else {

            controls.enabled = false;


            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';

        }

    };

    var pointerlockerror = function ( event ) {

        instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        //firefox fullscreen
        if ( /Firefox/i.test( navigator.userAgent ) ) {

            var fullscreenchange = function ( event ) {

                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                    element.requestPointerLock();
                }

            };

            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

            element.requestFullscreen();

        } else {

            element.requestPointerLock();

        }

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var blockedForward = false;
var blockedBackward = false;
var blockedLeft = false;
var blockedRight = false;



function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

	//sounds
    audio.src = 'sounds/Bomb-SoundBible.com-891110113.mp3';
 
    // crosshair
    var circleGeometry = new THREE.CircleGeometry(0.05, 32);
    //Load Circle pic:
    var crosshair = new THREE.Mesh(circleGeometry, new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.5, map:THREE.ImageUtils.loadTexture('resources/target.png')}));

    crosshair.position.copy( camera.position );
    crosshair.rotation.copy( camera.rotation );
    crosshair.updateMatrix();
    crosshair.translateZ( - 2 );


	controls = new THREE.PointerLockControls( camera, crosshair);
    scene.add( controls.getObject() );


    var onKeyDown = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;

            case 16: // shift
                speed = 60;
                break;

        }

    };

    var onKeyUp = function ( event ) {

        switch( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

            case 16: // shift
                speed = 30;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    raycaster = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,0,-1),0,1000);

    // floor

    geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    geometry.rotateX( - Math.PI / 2 );

    var grassTexture = THREE.ImageUtils.loadTexture('resources/grass2.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set( 40, 40 );
    material = new THREE.MeshBasicMaterial( {map:grassTexture});

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // objects

    geometry = new THREE.BoxGeometry( 20, 20, 20 );

    for ( var i = 0; i < 250; i ++ ) {

        var boxTexture = THREE.ImageUtils.loadTexture('resources/box.jpg');
        material = new THREE.MeshBasicMaterial( {map:boxTexture});

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        mesh.position.y = Math.floor( Math.random() * 20 ) * 50 + 10;
        mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
        scene.add( mesh );

        objects.push( mesh );

    }
	
	//EVIL BOSSES
	var targetGeometry = new THREE.BoxGeometry(30, 30, 30);
	var targetImageBogi = new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/bogomil.jpg')});
	var targetImageBankin = new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/bankin.jpg')});
	bogi = new THREE.Mesh(targetGeometry, targetImageBogi);
	bankin = new THREE.Mesh(targetGeometry, targetImageBankin);
	bogi.position.x = Math.floor( Math.random() * 25 ) * 20;
    bogi.position.y = Math.floor( Math.random() * 20 ) + 1400;
    bogi.position.z = Math.floor( Math.random() * 25 ) * 20;
	bankin.position.x = Math.floor( Math.random() * 25 ) * 20;
    bankin.position.y = Math.floor( Math.random() * 20 ) + 1400;
    bankin.position.z = Math.floor( Math.random() * 25  ) * 20;
	
	scene.add(bogi);
	scene.add(bankin);
	objects.push(bogi);
	objects.push(bankin);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    document.onmousedown = shoot;

}

function playSound() {
	if(!audio.paused){
		audio.pause;
		audio.currentTime = 0;
	}	
    audio.play();
}

function shoot() {
	playSound();
    objects.forEach(function(box){
       if (box.isTargeted) {
           scene.remove(box);
           objects.splice(objects.indexOf(box), 1);
       } 
    });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function collisionCheck() {

    if ( controlsEnabled ) {

        // unblock movement if key is still pressed
        if(moveForward)
        {
            blockedForward = false;
        }
        if(moveBackward)
        {
            blockedBackward = false;
        }
        if(moveLeft)
        {
            blockedLeft = false;
        }
        if(moveRight)
        {
            blockedRight = false;
        }

        //gravity
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        //side collision
        for(var i = 0; i< sideRays.length; i++)
        {
            raycaster.set(controls.getObject().position,controls.getHorizontalDirection(sideRays[i].clone()));
            var collisions = raycaster.intersectObjects(objects);
            if(collisions.length > 0 && collisions[0].distance <= 5)
            {
                if (i === 0 && moveForward) {
                    blockedForward = true;
                } else if (i === 2 && moveBackward) {
                    blockedBackward = true;
                }
                if (i === 1 && moveRight) {
                    blockedRight = true;
                } else if (i === 3 && moveLeft) {
                    blockedLeft = true;
                }
            }
        }

        //bot collision
        raycaster.set(controls.getObject().position,botRay);
        collisions = raycaster.intersectObjects(objects);
        if(collisions.length > 0 && collisions[0].distance <=20) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;
        }

        //top collision
        raycaster.set(controls.getObject().position,topRay);
        collisions = raycaster.intersectObjects(objects);
        if(collisions.length > 0 && collisions[0].distance <= 10) {

            velocity.y = Math.min(0, velocity.y);
            canJump = true;
        }

        // set speed to 0
        velocity.z = 0;
        velocity.x = 0;

        // add velocity based on any movement keys
        if ( moveForward && !blockedForward ) velocity.z -= speed;
        if ( moveBackward && !blockedBackward ) velocity.z += speed;
        if ( moveLeft && !blockedLeft ) velocity.x -= speed;
        if ( moveRight && !blockedRight) velocity.x += speed;

        //actual moving
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

    


        // ground check
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }



        prevTime = time;
    }
}

function targeting() {
    raycaster.set(controls.getObject().position,controls.getDirection(sideRays[0].clone()));
    var collisions = raycaster.intersectObjects(objects);
    if(collisions.length > 0)
    {
        if(target != collisions[0].object)
        {
            if(target){
                target.material.color.setHex(target.currentHex);
                target.isTargeted = false;
            }

            target = collisions[0].object;
            target.currentHex = target.material.color.getHex();
            target.material.color.setHex(0xff0000);
            target.isTargeted = true;
        }
    }
    else{
        if(target)
        {
            target.material.color.setHex(target.currentHex);
            target.isTargeted = false;
        }

        target = null;
    }
}

function victory(){

	if(objects.indexOf(bogi) === -1 && objects.indexOf(bankin) === -1)
	{
	var img = document.createElement('img');
	img.style.position = 'absolute';
	img.src = 'resources/freedom.jpg';
	img.style.borderRadius = "5px";
	img.style.left = window.innerWidth/2 - 400 + "px";
	img.style.top = window.innerHeight/2 - 200 + "px";
	document.body.appendChild(img);
	cancelAnimationFrame(id);
	document.onmousedown = null;
	}
}


function animate() {
    id = requestAnimationFrame( animate );
    collisionCheck();
	targeting();
	victory();
    renderer.render( scene, camera );
}
