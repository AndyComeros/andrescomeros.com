import * as THREE from 'three';
import { Int8Attribute, RedFormat, Vector3 } from 'three';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader, OBJLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

//boid 
class Boid{
    constructor(id,team,color,geom,scene){
        this.id = id;
        this.team = team;
        this.color = color;
        this.direction = new THREE.Vector3(randFloat(-1,1),randFloat(-1,1),randFloat(-1,1));
        this.direction.normalize();
        this.speed = 16;
        this.myScene = scene;

        this.shootCooldown = randFloat(2,5);
        this.shootCooldownLeft = randFloat(1,2);

        this.seperateRad = 5;
        this.alignRad    = 10;
        this.cohesionRad = 6;
        
        this.seperateStr = 8.5;
        this.alignStr =    10;
        this.cohesionStr = 8;

        this.isShooting = false;
       
        //const myGeom = new THREE.ConeGeometry(1,2,10,10);
        const myGeom = geom;//new THREE.BoxGeometry();
        const myMat = new THREE.MeshPhongMaterial({color: this.color, wireframe: false,});
        this.myMesh = new THREE.Mesh(myGeom, myMat);
        

        this.myMesh.position.x = 0;
        this.myMesh.position.y = 0;
        this.myMesh.position.z = 0;
        const dist = 10;
        this.myMesh.position.set(randFloat(-dist,dist),randFloat(-dist,dist),randFloat(-dist,dist));

        this.activeBullets = [];
        this.bulletMesh = null;
        this.bulletVel = new Vector3();        
    }

    //return vector pointing in average direction of neighbours
    align(ships){

        let steer = new Vector3(0);
        if(ships.length < 1)
            return steer;

        for(let i = 0; i < ships.length; i++){
          steer.add(ships[i].direction);
        }
        return steer.normalize();
    }

    //return vector poiting towards average position of neighbours
    cohesion(ships){
        let steer = new Vector3(0);
        let avePos = new Vector3(0);

        if(ships.length < 1)
        return steer;

        for(let i = 0; i < ships.length; i++){
            avePos.add(ships[i].myMesh.position);
        }

        avePos.divideScalar(ships.length);

        steer.subVectors(avePos,this.myMesh.position);

        return steer;
    }

    //return vector pointing away from average position of neighbours
    seperate(ships){
    
        return this.cohesion(ships).multiplyScalar(-1);
    }

    //do boid stuff
    update(ships, deltaTime){

        let aliBoid = [];
        let sepBoid = [];
        let cohBoid = [];

        const inFront = new Vector3().addVectors(this.myMesh.position,this.direction.multiplyScalar(1.2));
        for(let i = 0; i < ships.length; i++){
            
            if(ships[i].id != this.id){
                
                const dir = new Vector3();
                dir.subVectors(ships[i].myMesh.position,this.myMesh.position);
                const len = Math.abs(dir.length());

                if(len < this.cohesionRad && this.team == ships[i].team){
                    cohBoid.push(ships[i]);
                }
                if(len < this.seperateRad){
                    sepBoid.push(ships[i]);
                }
                if(len < this.alignRad && this.team == ships[i].team){
                    aliBoid.push(ships[i]);
                }
                
                if(len < 10 && ships[i].team != this.team){
                    this.shoot();
                }
            }

        }

        //add boid steer behavour
        this.direction.add(this.seperate(sepBoid).multiplyScalar(this.seperateStr * deltaTime));
        this.direction.add(this.   align(aliBoid).multiplyScalar(this.alignStr  * deltaTime));
        this.direction.add(this.cohesion(cohBoid).multiplyScalar(this.cohesionStr * deltaTime));
        
        if(this.direction.length() > this.speed){
            this.direction.normalize().multiplyScalar(this.speed);
        }

        //apply direction vector to position
        let look = new Vector3();
        look.addVectors(this.direction, this.myMesh.position);
        this.myMesh.lookAt(look);
       
        this.myMesh.position.x += this.direction.x * delta;
        this.myMesh.position.y += this.direction.y * delta;
        this.myMesh.position.z += this.direction.z * delta;


        const boxSize = 100;
        const centMagnitism = this.cohesionStr * 2;
        if(this.myMesh.position.x > boxSize/2)
            this.direction.add(new Vector3(-1,0,0).multiplyScalar(centMagnitism ));
        if(this.myMesh.position.x < boxSize/-2)
        this.direction.add(new Vector3(1,0,0).multiplyScalar(centMagnitism ));
            
        if(this.myMesh.position.y > boxSize/2)
            this.direction.add(new Vector3(0,-1,0).multiplyScalar(centMagnitism ));
        if(this.myMesh.position.y < boxSize/-2)
        this.direction.add(new Vector3(0,1,0).multiplyScalar(centMagnitism ));
            
        if(this.myMesh.position.z > boxSize/2)
        this.direction.add(new Vector3(0,0,-1).multiplyScalar(centMagnitism ));
        if(this.myMesh.position.z < boxSize/-2)
        this.direction.add(new Vector3(0,0,1).multiplyScalar(centMagnitism ));

     this.shootCooldownLeft -= delta;
        

        if(this.shootCooldownLeft <= 0 && this.isShooting){
            this.isShooting = false;
            this.myScene.remove(this.bulletMesh);
        }
        if(this.isShooting && this.bulletMesh){
            this.bulletMesh.position.x += this.bulletVel.x;
            this.bulletMesh.position.y += this.bulletVel.y;
            this.bulletMesh.position.z += this.bulletVel.z;
        }
    }

    shoot(){
        if(!this.isShooting && this.shootCooldownLeft <= 0){
            this.isShooting = true;
            let geom = new THREE.BoxGeometry(0.1,0.3);
            const mat = new THREE.MeshBasicMaterial({color:0x00ff04, wireframe: false,});
            const mesh = new THREE.Mesh(geom, mat);

            mesh.position.x = this.myMesh.position.x
            mesh.position.y = this.myMesh.position.y
            mesh.position.z = this.myMesh.position.z
            let look = new Vector3();
            look.addVectors(this.direction, this.myMesh.position);
            mesh.lookAt(look);
            
            this.bulletMesh = mesh;

            this.bulletVel.x = this.direction.x;
            this.bulletVel.y = this.direction.y;
            this.bulletVel.z = this.direction.z;
            this.bulletVel.normalize() * 20;

            this.myScene.add(this.bulletMesh);

            this.shootCooldownLeft = this.shootCooldown;
        }

    }

}
//////////////////////////
// scene
const mainScene = new THREE.Scene();


// camera
const FOV = 90;
const ASPECTR = window.innerWidth/window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.01,1000);

// renderer
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#bg"),});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 50;
camera.position.y = 10;

var clock = new THREE.Clock();
var delta = 0;

let shipCount = 150; 
const ship = [];

function animate(){

    //animate boids
    for(let i = 0; i < shipCount; i++){
        ship[i].update(ship, delta);
    }

    delta = clock.getDelta();

    requestAnimationFrame(animate);
    renderer.render(mainScene, camera);
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

//3d object

const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

};

const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
mainScene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
camera.add( pointLight );
mainScene.add( camera );

//load geometry
let loader = new GLTFLoader();
loader.load(
    'models/vechicle.glb',
    
    //when models are loaded
    function ( gltf ) {
        


        let shipGeom = gltf.scene.children[0];
        console.log(shipGeom);
        //spawn spaceship boids
        let colors = [0x008c8cF,0xFF00C9];
        for(let i = 0; i < shipCount; i++){
            let n = randInt(0,1);
            ship[i] = (new Boid(i,n, colors[n], shipGeom.geometry, mainScene));
            mainScene.add(ship[i].myMesh);
        }
        ship[0].shoot();
        animate();
        
         
       },

    // called while loading is progressinga
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' + error);
    }
);    















//old wave code
/*
     // Terrain shader
     const terrainMat = new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 1.0},
        },

        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

        wireframe: true,
    });

    const pWidth = 100;
    const pHeight = 100;
    const pRes = 30;

    let geom = new THREE.PlaneGeometry(pWidth,pHeight,pRes,pRes);
    const mat = new THREE.MeshBasicMaterial({color:0xff00fb, wireframe: true,});
    const terrain = new THREE.Mesh(geom, terrainMat);

    terrain.rotateX(80);
    scene.add(terrain);
*/