var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var objects = [];
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controlsEnabled = true;
            controls.enabled = true;
            circleControls.enabled = true;

            blocker.style.display = 'none';

        } else {

            controls.enabled = false;
            circleControls.enabled = false;

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


var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x999999, 1);
document.body.appendChild(renderer.domElement);


var controls = new THREE.PointerLockControls(camera);
scene.add(controls.getObject());

// floor

var geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
geometry.rotateX(-Math.PI / 2);

for (var i = 0, l = geometry.vertices.length; i < l; i++) {

    var vertex = geometry.vertices[i];
    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

}

for (var i = 0, l = geometry.faces.length; i < l; i++) {

    var face = geometry.faces[i];
    face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.4 + 0.75, 0.75, Math.random() * 0.4 + 0.75);
    face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.4 + 0.75, 0.75, Math.random() * 0.4 + 0.75);
    face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.4 + 0.75, 0.75, Math.random() * 0.4 + 0.75);

}

material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});

mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// objects

geometry = new THREE.BoxGeometry( 20, 20, 20 );

for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

    var face = geometry.faces[ i ];
    face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

}

for ( var i = 0; i < 50; i ++ ) {

    material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
    mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
    mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
    scene.add( mesh );

    material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    objects.push( mesh );

}

var circleGeometry = new THREE.CircleGeometry(0.05, 32);
//Load Circle pic:
var circle = new THREE.Mesh(circleGeometry, new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/target.png')}));

circle.position.copy( camera.position );
circle.rotation.copy( camera.rotation );
circle.updateMatrix();
circle.translateZ( - 1 );

console.log(circle.position);
scene.add(circle);

var targetImages = [];
var targetGeometry = new THREE.SphereGeometry(5, 30, 30);
var targetImageBogi = new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/bogomil.jpg')});
var targetImageBankin = new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/bankin.jpg')});
var targetImageNakov = new THREE.MeshBasicMaterial( {map:THREE.ImageUtils.loadTexture('resources/nakov.jpg')});
targetImages.push(targetImageBankin);
targetImages.push(targetImageBogi);
targetImages.push(targetImageNakov);

// creates enemies with random images at random places at the scene at every 5 seconds
function createEnemy() {
    var imagePicker = Math.floor(Math.random() * 3);
    var image = targetImages[imagePicker];
    var enemy = new THREE.Mesh(targetGeometry, image);

    enemy.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
    enemy.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
    enemy.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

    scene.add(enemy);
}

setInterval(createEnemy, 5000);

var circleControls = new THREE.CircleControls(circle);
scene.add(circleControls.getObject());
console.log(circle.position);

var onKeyDown = function (event) {

    switch (event.keyCode) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;

    }

};

var onKeyUp = function (event) {

    switch (event.keyCode) {

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

    }

};

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);


function render() {
    requestAnimationFrame(render);
    //controls.update();
    renderer.render(scene, camera);
}
render();
animate();


function animate() {

    requestAnimationFrame(animate);


    raycaster.ray.origin.copy(controls.getObject().position);
    //raycaster.ray.origin.copy(circleControls.getObject().position);
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects(objects);

    var isOnObject = intersections.length > 0;

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    if (moveForward) velocity.z -= 400.0 * delta;
    if (moveBackward) velocity.z += 400.0 * delta;

    if (moveLeft) velocity.x -= 400.0 * delta;
    if (moveRight) velocity.x += 400.0 * delta;

    if (isOnObject === true) {
        velocity.y = Math.max(0, velocity.y);

        canJump = true;
    }

    controls.getObject().translateX(velocity.x * delta);
    circleControls.getObject().translateX(velocity.x * delta);
    //circle.translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    circleControls.getObject().translateY(velocity.y * delta);
    //circle.translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);
    circleControls.getObject().translateZ(velocity.z * delta);
    //circle.translateZ(velocity.z * delta);

    if (controls.getObject().position.y < 10) {

        velocity.y = 0;
        //circle.position.y = 10;
        controls.getObject().position.y = 10;
        circleControls.getObject().position.y = 10;
        canJump = true;

    }

    prevTime = time;


    renderer.render(scene, camera);

}

