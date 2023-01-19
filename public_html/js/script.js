import * as THREE from 'three';
import { RedFormat, Vector3 } from 'three';
import { randFloat, randInt } from 'three/src/math/MathUtils';

class SpaceShip{
    constructor(id,team,color,mesh){
        this.id = id;
        this.team = team;
        this.color = color;
        this.direction = new THREE.Vector3(randFloat(-1,1),randFloat(-1,1),randFloat(-1,1));
        this.direction.normalize();
        this.speed = 15;

        

        this.seperateRad = 3;
        this.alignRad    = 6;
        this.cohesionRad = 6;
        

        this.seperateStr = 0.02;
        this.alignStr =      0.01;
        this.cohesionStr = 0.01;
        

        //const myGeom = new THREE.ConeGeometry(1,2,10,10);
        const myGeom = new THREE.BoxGeometry();
        const myMat = new THREE.MeshBasicMaterial({color: this.color, wireframe: false,});
        this.myMesh = new THREE.Mesh(myGeom, myMat);
       

        this.myMesh.position.x = 0;
        this.myMesh.position.y = 0;
        this.myMesh.position.z = 0;
        this.myMesh.position.set(randFloat(-10,10),randFloat(-10,10),0);

        //steer vars
        let steerTotal;

        //tmep
        //show direction of boid
        this.dirHelp = new THREE.ArrowHelper(this.direction, this.myMesh.position, 2, 0xff0000,);
        scene.add(this.dirHelp);
        
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
                
                if(Math.abs(dir.length()) < this.cohesionRad && this.team == ships[i].team){
                    cohBoid.push(ships[i]);
                }
                if(Math.abs(dir.length()) < this.seperateRad){
                    sepBoid.push(ships[i]);
                }
                if(Math.abs(dir.length()) < this.alignRad && this.team == ships[i].team){
                    aliBoid.push(ships[i]);
                }
            }

        }
    
        //add boid steer behavour
        this.direction.add(this.seperate(sepBoid).multiplyScalar(this.seperateStr));
        this.direction.add(this.   align(aliBoid).multiplyScalar(this.alignStr));
        this.direction.add(this.cohesion(cohBoid).multiplyScalar(this.cohesionStr));
        

        this.direction.normalize();
        

        //apply direction vector to position
        let look = new Vector3();
        look.addVectors(this.direction, this.myMesh.position);
        this.myMesh.lookAt(look);
        
        this.dirHelp.position.copy(this.myMesh.position);
        this.dirHelp.setDirection(this.direction);
        this.dirHelp.setLength(2);
       

        this.myMesh.position.x += this.direction.x * this.speed * delta;
        this.myMesh.position.y += this.direction.y * this.speed * delta;
        this.myMesh.position.z += this.direction.z * this.speed * delta;


        const boxSize = 100;
        const centMagnitism = 0.2;
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

        //inside limited volume
        /*
        const boxSize = 50;
        if(this.myMesh.position.x > boxSize/2)
            this.myMesh.position.x = boxSize/-2;
        if(this.myMesh.position.x < boxSize/-2)
            this.myMesh.position.x = boxSize/2;
            
        if(this.myMesh.position.y > boxSize/2)
            this.myMesh.position.y = boxSize/-2;
        if(this.myMesh.position.y < boxSize/-2)
            this.myMesh.position.y = boxSize/2;
            
        if(this.myMesh.position.z > boxSize/2)
            this.myMesh.position.z = boxSize/-2;
        if(this.myMesh.position.z < boxSize/-2)
            this.myMesh.position.z = boxSize/2;
        */

    }

}



// scene
const scene = new THREE.Scene();

// camera
const FOV = 90;
const ASPECTR = window.innerWidth/window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.01,1000);

// renderer
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#bg"),});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);//like glDraw()

camera.position.z = 30;
camera.position.y = 10;

//add tool
const axisTool = new THREE.AxesHelper(50);
scene.add(axisTool);


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

//spawn boids
const ship = [];
let shipCount = 200;
let colors = [0xff00fb,0x00fff7];
for(let i = 0; i < shipCount; i++){
    let n = randInt(0,1);
    ship[i] = (new SpaceShip(i,n, colors[n]));
    scene.add(ship[i].myMesh);
}


// resize func
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// main loop

var clock = new THREE.Clock();
var speed = 2;
var delta = 0;
function animate(){

    //animate terrain
    terrainMat.uniforms.time.value += 1 * delta;

    //animate boids
    for(let i = 0; i < shipCount; i++){
        ship[i].update(ship)
    }


    delta = clock.getDelta();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

animate();

//////////////
