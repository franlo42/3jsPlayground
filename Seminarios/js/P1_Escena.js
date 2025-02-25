/**
 * Escena.js
 * 
 * Practica AGM #1. Escena basica en three.js
 * Seis objetos organizados en un grafo de escena con
 * transformaciones, animacion basica y modelos importados
 * 
 * @author 
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";

// Variables de consenso
let renderer, scene, camera;

// Otras Variables globales
let figures
let angulo = 0

// Acciones
init();
loadScene();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    camera.lookAt( new THREE.Vector3(0,1,0) );
  
}

function loadScene()
{
    const material = new THREE.MeshNormalMaterial( {wireframe:false});

    //LA LUZ
    const dirLight = new THREE.DirectionalLight(0xffffff, 10);
    dirLight.position.set(0, 1, 0);
    scene.add(dirLight);

    // TO DO: Construir un suelo en el plano XZ
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10));
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    // TO DO: Construir una escena con 5 figuras diferentes posicionadas
    // en los cinco vertices de un pentagono regular alredor del origen

    // Cálculo de vértices del pentágono
    const sides = 5;
    const radius = 3;
    const pentagonVertices = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        pentagonVertices.push(new THREE.Vector3(x, 0, z));
    }

    // Crear la figura pentagonal visual
    const pentagonShape = new THREE.Shape();
    pentagonShape.moveTo(pentagonVertices[0].x, pentagonVertices[0].z);
    for (let i = 1; i < pentagonVertices.length; i++) {
        pentagonShape.lineTo(pentagonVertices[i].x, pentagonVertices[i].z);
    }
    pentagonShape.closePath();
    
    const pentagonGeometry = new THREE.ShapeGeometry(pentagonShape);
    const pentagonMesh = new THREE.Mesh(pentagonGeometry, material);
    pentagonMesh.rotation.x = -Math.PI / 2;
    pentagonMesh.position.y = 0.01;
    scene.add(pentagonMesh);

    const geoCubo = new THREE.BoxGeometry(2,2,2);
    const geoEsfera = new THREE.SphereGeometry(1, 20, 20);
    const geoKnott = new THREE.TorusKnotGeometry();//10,3,64,8,2,5
    const geoIcosaedro = new THREE.IcosahedronGeometry();//10
    const geoCono = new THREE.ConeGeometry();//7,8,4,1

    const cubo = new THREE.Mesh(geoCubo, material);
    const esfera = new THREE.Mesh(geoEsfera, material);
    const knott = new THREE.Mesh(geoKnott, material);
    const icosaedro = new THREE.Mesh(geoIcosaedro, material);
    const cono = new THREE.Mesh(geoCono, material);

    figures = new THREE.Object3D();
    figures.position.y = 1;
    cubo.position.copy(pentagonVertices[0]);
    esfera.position.copy(pentagonVertices[1]);
    knott.position.copy(pentagonVertices[2]);
    knott.position.y+=1;
    icosaedro.position.copy(pentagonVertices[3]);
    cono.position.copy(pentagonVertices[4]);
    figures.add(cubo,esfera,knott,icosaedro,cono);

    scene.add(figures);

    // TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    const glloader = new GLTFLoader();

    glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
        gltf.scene.position.set(0,-1,0);
        gltf.scene.rotation.y = -Math.PI/2;
        figures.add( gltf.scene );
        
    }, undefined, function ( error ) {
        
        console.error( error );
        
    } );
    
    // TO DO: Añadir a la escena unos ejes
    scene.add( new THREE.AxesHelper(3) );
}

function update()
{
    // TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
    // y del conjunto pentagonal sobre el objeto importado

    // Rotacion de cada uno sobre sí mismo
    figures.children.forEach( obj => {
        obj.rotation.y += 0.01;
    });

    // Rotación del pentagono alrededor del centro
    figures.rotation.y += 0.005;
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}