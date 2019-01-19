// LordSk 2018

const rdrWidth = window.innerWidth;
const rdrHeight = 400;

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
let camera = new THREE.PerspectiveCamera( 30, rdrWidth / rdrHeight, 0.001, 5000 );

let renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: false});
renderer.setSize( rdrWidth, rdrHeight );
renderer.setPixelRatio( window.devicePixelRatio );
$('#animatedHeader').get(0).appendChild( renderer.domElement );

const noiseScale = new THREE.Vector4(0.005, 0.01, 0.03, 0.1);
const elevation = new THREE.Vector4(14, 3, 2, 1);

let matDepth = new THREE.ShaderMaterial({

	uniforms: {
		u_time: { value: 1.0 },
		resolution: { value: new THREE.Vector2() },
        u_noiseScale: { value: noiseScale },
        u_elevation: { value: elevation },
	},

	vertexShader: document.getElementById('vertexShader').textContent,
	fragmentShader: document.getElementById('fragmentShader').textContent
});

const matPlanet = new THREE.ShaderMaterial({

	uniforms: {
        u_color: { value: new THREE.Vector3(1, 0, 0) },
	},
	vertexShader: document.getElementById('vertPlanet').textContent,
	fragmentShader: document.getElementById('fragPlanet').textContent
});

const matShip = new THREE.ShaderMaterial({

	uniforms: {
        u_color: { value: new THREE.Vector3(1, 0, 0) },
	},
	vertexShader: document.getElementById('vertPlanet').textContent,
	fragmentShader: document.getElementById('fragShip').textContent
});

const matTitle = new THREE.ShaderMaterial({

	uniforms: {
        u_color: { value: new THREE.Vector3(1, 0, 0) },
        u_time: 0.0,
	},
	vertexShader: document.getElementById('vertPlanet').textContent,
	fragmentShader: document.getElementById('fragTitle').textContent
});

camera.position.z = 0;
camera.position.y = 20;
camera.lookAt.y = 10;

const planetGeo = new THREE.SphereBufferGeometry(1.0, 24, 24);
const ringGeo = new THREE.RingBufferGeometry(0.7, 1.0, 64);

let objLoader = new THREE.OBJLoader();
let shipGeo = null;

// load ship model
objLoader.load('home/ship6.obj',
	function(object) { // done
        shipGeo = object.children[0].geometry;
        //spawnShip(0, 10.0, -50.0, 10.0, 1.0, 0.0);
	},
	function(xhr) { // progress
		//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function(error) { // error
		console.log('Could not load ship6.obj');
	}
);

// plane
const planeDepth = 400;
let planeGeo = new THREE.PlaneBufferGeometry(1200, planeDepth, 600, 400);
let planeMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
let planeMesh = new THREE.Mesh(planeGeo, matDepth);

planeMesh.position.x = 0;
planeMesh.position.z = -planeDepth * 0.5;
planeMesh.position.y = 0;
planeMesh.rotation.x = -Math.PI * 0.5;
planeMesh.matrixAutoUpdate = false;
planeMesh.updateMatrix();
scene.add(planeMesh);

let planetList = [];
let shipList = [];
let smokeParticleList = [];

let radius = rand(500.0, 1000.0);
let planet = spawnPlanet(rand(-1000.0, 1000.0), -radius * 0.25, radius, rand(-3.0, 3.0),
                rand(4.0, 8.0), rand(2, 6));

let timeClock = new THREE.Clock();
let t0 = timeClock.getElapsedTime();
let timeScale = 1.0;
let time = 0.0;

let spawnShipCd = 3.0;

function animate()
{
    requestAnimationFrame(animate);
    
    let t1 = timeClock.getElapsedTime();
    let delta = (t1 - t0) * timeScale;
    time += delta;
    t0 = t1;

    planeMesh.material.uniforms.u_time.value = time * 10;

    /*let noiseScale = [];
    let elevation = [];

    for(let i = 1; i < 5; i++) {
        noiseScale[i-1] = parseFloat($('#noiseScale' + i).val());
        elevation[i-1] = parseFloat($('#elevation' + i).val());
    }

    //console.log(time);
    //console.log(noiseScale1, noiseScale2);
    //console.log(elevation1, elevation2);

    /*planeMesh.material.uniforms.u_noiseScale.value.x = noiseScale[0];
    planeMesh.material.uniforms.u_noiseScale.value.y = noiseScale[1];
    planeMesh.material.uniforms.u_noiseScale.value.z = noiseScale[2];
    planeMesh.material.uniforms.u_noiseScale.value.w = noiseScale[3];
    planeMesh.material.uniforms.u_elevation.value.x = elevation[0];
    planeMesh.material.uniforms.u_elevation.value.y = elevation[1];
    planeMesh.material.uniforms.u_elevation.value.z = elevation[2];
    planeMesh.material.uniforms.u_elevation.value.w = elevation[3];*/

    for(let i = 0; i < planetList.length; i++) {
        let p = planetList[i];
        p.position.x += delta * p.velocity.x;
        p.position.y += delta * p.velocity.y;

        if(p.moonList) {
            for(let j = 0; j < p.moonList.length; j++) {
                let m = p.moonList[j];
                
                let arm = m.position.clone();
                let vn = m.velocity.clone().normalize();
                arm.sub(p.position).normalize();
                let tangent = new THREE.Vector3().crossVectors(arm, vn);
                let newVel = new THREE.Vector3().crossVectors(tangent, arm);
                newVel.setLength(m.velocity.length());
                m.velocity = newVel;
                
                // apply velocity
                m.position = p.position.clone();
                m.position.add(newVel.clone().multiplyScalar(delta));
            }
        }

        if(p.ring) {
            p.ring.position.copy(p.position);
        }

        if(p.position.y > 800 + p.radius) {
            planetList.splice(i, 1);
            onPlanetOutside(p);

            // spawn a new planet
            let radius = rand(500.0, 1000.0);
            spawnPlanet(rand(-1000.0, 1000.0), -150 - radius * 0.5, radius, rand(-3.0, 3.0),
                rand(4.0, 8.0), rand(1, 5));
        }
    }

    
    if(spawnShipCd > 0.0) {
        spawnShipCd -= delta;
        if(spawnShipCd <= 0.0) {
            spawnRandomShip();
        }
    }

    for(let i = 0; i < shipList.length; i++) {
        let s = shipList[i];
        s.position.add(s.velocity.clone().multiplyScalar(delta));

        if(Math.abs(s.position.x) > 1000.0) {
            onShipOutside(s);
            shipList.splice(i, 1);
            spawnShipCd = rand(5.0, 10.0);
        }
    }

	renderer.render(scene, camera);
}

animate();

function spawnPlanet(x, y, radius, dx, dy, moonCount)
{
    moonCount = Math.round(moonCount);
    let planetMesh = new THREE.Mesh(planetGeo, matPlanet.clone());
    const c = rand(0.6, 0.85);
    planetMesh.material.uniforms.u_color.value = new THREE.Vector3(c, c + 0.05, c + 0.1);
    planetMesh.position.x = x;
    planetMesh.position.y = y;
    planetMesh.position.z = -2000;
    planetMesh.velocity = {x: dx, y: dy};
    planetMesh.scale.setScalar(radius);
    planetMesh.radius = radius;
    scene.add(planetMesh);
    planetList.push(planetMesh);

    // spawn moons
    if(Math.random() > 0.5) {
        //console.log("moons: ", moonCount);
        for(let i = 0; i < moonCount; i++) {
            spawnMoon(planetMesh, rand(20, 80.0), rand(400, 800),
                rand(0, Math.PI * 2.0), rand(0, Math.PI * 2.0),
                rand(-1.0, 1.0), rand(-1.0, 1.0), rand(-1.0, 1.0), rand(10.0, 30.0));
        }
    }
    // spawn a ring
    else {
        //console.log("ring");
        let ringMat = matPlanet.clone();
        ringMat.side = THREE.DoubleSide;
        const c = rand(-0.1, 0.1);
        ringMat.uniforms.u_color.value = new THREE.Vector3(0.17 + c, 0.53 + c, 0.70 + c);
        let ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.scale.x = radius * 1.8;
        ringMesh.scale.y = radius * 1.8;
        ringMesh.rotation.set(rand(0.0, Math.PI), rand(0.0, Math.PI), rand(0.0, Math.PI));
        ringMesh.position.copy(planetMesh.position);

        planetMesh.ring = ringMesh;
        scene.add(ringMesh);
    }

    return planetMesh;
}

function spawnMoon(planet, radius, dist, cx, cy, vx, vy, vz, speed)
{
    let moonMesh = new THREE.Mesh(planetGeo, matPlanet.clone());
    const c = rand(-0.1, 0.1);
    moonMesh.material.uniforms.u_color.value = new THREE.Vector3(0.17 + c, 0.53 + c, 0.70 + c);
    let polar = new THREE.Spherical(planet.radius + dist, cx, cy);
    let local = new THREE.Vector3().setFromSpherical(polar);
    moonMesh.position.x = planet.position.x + local.x;
    moonMesh.position.y = planet.position.y + local.y;
    moonMesh.position.z = planet.position.z + local.z;
    moonMesh.velocity = new THREE.Vector3(vx, vy, vz).setLength(speed);
    moonMesh.scale.setScalar(radius);
    scene.add(moonMesh);

    if(!planet.moonList) {
        planet.moonList = [];
    }
    planet.moonList.push(moonMesh);
}

function onPlanetOutside(planet)
{
    scene.remove(planet);
    if(planet.moonList) {
        for(let j = 0; j < planet.moonList.length; j++) {
            let m = planet.moonList[j];
            scene.remove(m);
        }
    }
    if(planet.ring) {
        scene.remove(planet.ring);
    }
}

function rand(min, max)
{
    return min + Math.random() * (max - min);
}

function spawnShip(x, y, z, scale, vx, vz)
{
    let shipMat = matShip.clone();
    //const c = rand(0.0, 0.2);
    shipMat.uniforms.u_color.value.set(0.17, 0.53, 0.70);
    let shipMesh = new THREE.Mesh(shipGeo, shipMat);
    shipMesh.scale.setScalar(scale);

    let shipGroup = new THREE.Group();
    shipGroup.add(shipMesh);
    shipGroup.velocity = new THREE.Vector3(vx, 0, vz);

    let vn = new THREE.Vector3(vx, 0, vz).normalize();
    let angle = Math.atan2(vn.x, vn.z);
    shipGroup.rotation.y = angle - Math.PI;
    shipGroup.position.set(x, y, z);

    scene.add(shipGroup);
    shipList.push(shipGroup);
}

function spawnRandomShip()
{
    const speed = rand(160.0, 200.0);
    let z = rand(-100.0, -250.0);
    let zend = rand(-50.0, -400.0);
    const dx = rand(0.0, 1.0) > 0.5 ? 1.0: -1.0;
    let v = new THREE.Vector2(-dx * 1200.0, zend - z).setLength(speed);
    let x = 600.0 * dx;
    let y = 27.0;
    let scale = rand(8.0, 12.0);
    //console.log('spawn ship', x, y, z, v);
    spawnShip(x, y, z, scale, v.x, v.y);
}

function onShipOutside(ship)
{
    scene.remove(ship);
}

function spawnTitle()
{
    let titleMat = matTitle.clone();
    titleMat.uniforms.u_color.value.set(1.0, 0.0, 0.0);

    titleMesh = new THREE.Mesh(titleGeo, titleMat);
    titleMesh.scale.setScalar(10.0);
    let size = new THREE.Vector3();
    titleGeo.boundingBox.getSize(size);
    const width = size.x;
    titleMesh.position.set(width * -0.5 * 10.0, 22, -300);
    titleMesh.velocity = new THREE.Vector3(0.0, 0.0, 6.0);

    scene.add(titleMesh);
}