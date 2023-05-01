import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import Stats from "three/examples/jsm/libs/stats.module"

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'


import starVertexShader from './shaders/stars/vertex.glsl'
import starFragmentShader from './shaders/stars/fragment.glsl'



const debugObject = {}

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const stats = new Stats()
document.body.appendChild(stats.dom)

//- Scene 
const scene = new THREE.Scene()
scene.background = new THREE.Color("#010209")
const axesHelper = new THREE.AxesHelper(100)
axesHelper.position.y = 1
// scene.add(axesHelper)

scene.fog = new THREE.Fog("#010209", 5, 12);


// -Water 
//! Geometry
// const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)
const waterGeometry = new THREE.PlaneGeometry(20, 20, 512, 512)

//! Colors
debugObject.depthColor = '#18638c'
debugObject.surfaceColor = '#71c2f4'

//- Material 
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,

    uniforms:
    {
        uTime: { value: 0 },
        
        uBigWavesElevation: { value: 0.6 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.434, 0.854) },
        uBigWavesSpeed: { value: 0.6 },

        uSmallWavesElevation: { value: 0.206 },
        uSmallWavesFrequency: { value: 0.837 },
        uSmallWavesSpeed: { value: 0 },
        uSmallIterations: { value: 5 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.00 },
        uColorMultiplier: { value: 1.284 },
        
        fogColor:    { type: "c", value: scene.fog.color },
    	fogNear:     { type: "f", value: scene.fog.near },
    	fogFar:      { type: "f", value: scene.fog.far }

    },
    fog: true,
})

//- Mesh 
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

//- Fireflies
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 1200
// const positionArray = new Float32Array(firefliesCount * 3)
// const scaleArray = new Float32Array(firefliesCount)
const positionArray = new Float32Array(4000 * 3)
const scaleArray = new Float32Array(4000)

for(let i = 0; i < firefliesCount; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 20
    positionArray[i * 3 + 1] = Math.random() * (4 - 2 + 1) + 4
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 20

    scaleArray[i] = Math.random()
}

//! positive X Position 
for(let i = 0; i < 150; i++)
{
    positionArray[i * 3 + 0] = 10
    positionArray[i * 3 + 1] = Math.random() * (4 -0) + 0
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 20

    scaleArray[i] = Math.random()

}

//! negative X Position
for(let i = 150; i < 300; i++)
{
    positionArray[i * 3 + 0] =  -10
    positionArray[i * 3 + 1] = Math.random() * (4 -0) + 0
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 20

    scaleArray[i] = Math.random()

}

//! positive Z Position
for(let i = 300; i < 500; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 20
    positionArray[i * 3 + 1] = Math.random() * (4 -0) + 0
    positionArray[i * 3 + 2] = 10

    scaleArray[i] = Math.random()

}

//! negative Z Position
for(let i = 500; i < 700; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 20
    positionArray[i * 3 + 1] = Math.random() * (4 -0) + 0
    positionArray[i * 3 + 2] = -10

    scaleArray[i] = Math.random()

}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

//! Material
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 90 }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

//! Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

//- Camera 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3, 2, 1)
scene.add(camera)

//- Controls 
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = 1.3
controls.minPolarAngle = 0.9
controls.maxDistance = 6
controls.minDistance = 3


//- Renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//- Animate 
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

     //! Animate Fireflies
     firefliesMaterial.uniforms.uTime.value = elapsedTime

    waterMaterial.uniforms.uTime.value = elapsedTime

    controls.update()
    renderer.render(scene, camera)
    stats.update()
    window.requestAnimationFrame(tick)
}

tick()

//- GUI 

const gui = new dat.GUI({ width: 340 })
gui.close()

//! Sea
const colorsGuiFolder = gui.addFolder("Colors")
colorsGuiFolder.close()

colorsGuiFolder.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
colorsGuiFolder.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

colorsGuiFolder.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
colorsGuiFolder.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })


const bigWavesGuiFolder = gui.addFolder("Big Waves")
bigWavesGuiFolder.close()

bigWavesGuiFolder.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
bigWavesGuiFolder.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
bigWavesGuiFolder.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
bigWavesGuiFolder.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')

const smallWavesGuiFolder = gui.addFolder("Small Waves")
smallWavesGuiFolder.close()

smallWavesGuiFolder.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
smallWavesGuiFolder.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
smallWavesGuiFolder.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
smallWavesGuiFolder.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

//! Stars
gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')


//! Camera
const cameraGuiFolder = gui.addFolder("Camera")
cameraGuiFolder.close()

cameraGuiFolder.add(camera.position, "x").min(-10).max(10).step(0.01).name("Position X")
cameraGuiFolder.add(camera.position, "y").min(-10).max(10).step(0.01).name("Position Y")
cameraGuiFolder.add(camera.position, "z").min(-10).max(10).step(0.01).name("Position Z")