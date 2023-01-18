import * as THREE from 'three';
import { RedFormat } from 'three';

//scene
const scene = new THREE.Scene();

//camera
const FOV = 90;
const ASPECTR = window.innerWidth/window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.01,1000);

//renderer
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#bg"),});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);//like glDraw()

camera.position.z = 30;
camera.position.y = 10;

//shader
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
const cust = new THREE.Mesh(geom, terrainMat);

for(let x = 0; x < pWidth; ++x){
    for(let y = 0; y < pWidth; ++y){
        
    }
}

cust.rotateX(80);
scene.add(cust);

renderer.render(scene, camera);

//resize func
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate(){

    terrainMat.uniforms.time.value += 0.01;
    //cust.rotateY(0.1);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

animate();

/////////////////////
/* Old test scene
//random range func
function randomNum(max,min){
    return (Math.random() * (max - min) ) + min;
}


//other stuff
ballCount = 6;
maxVel = 0.10;
const balls = [];
let rangeX = 30;
let rangeY = 30;
let rangeZ = 30;

for(let i = 0; i < ballCount; i++){

    const geom = new THREE.SphereGeometry();
    const material = new THREE.MeshPhongMaterial({color:0xff00fb,});
    const ball = new THREE.Mesh(geom, material);

    ball.position.setX(randomNum(rangeX/2,rangeX/-2));
    ball.position.setY(randomNum(rangeY/2,rangeY/-2));

    balls.push({object: ball, velX: randomNum(maxVel,-maxVel), velY: randomNum(maxVel, -maxVel),velZ: randomNum(maxVel, -maxVel),});
    scene.add(ball);
}
camera.position.setZ(30);

//add ligts
dirLight = new THREE.DirectionalLight();
scene.add(dirLight);

function animate(){
    for(let i = 0; i < ballCount; i++){
        balls[i].object.position.x += balls[i].velX;
        balls[i].object.position.y += balls[i].velY;
        balls[i].object.position.z += balls[i].velZ;

        if(balls[i].object.position.x > rangeX/2 || balls[i].object.position.x < rangeX/-2){
            balls[i].velX *= -1;
        }
        if(balls[i].object.position.y > rangeY/2 || balls[i].object.position.y < rangeY/-2){
            balls[i].velY *= -1;
        }
        if(balls[i].object.position.z > rangeZ/2 || balls[i].object.position.z < rangeZ/-2){
            balls[i].velZ *= -1;
        }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

camera.position.setZ(30);
animate();
*/
