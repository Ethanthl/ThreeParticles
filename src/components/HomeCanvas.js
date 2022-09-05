import * as THREE from "three";
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import img1 from '../assets/img/spongebob.png';
import img2 from '../assets/img/patrick.png';
import mask from '../assets/img/mask.jpg';
import { DoubleSide, StereoCamera } from "three";
import { gsap } from "gsap";


// init

export default class HomeCanvas {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.time = 0;
    this.move = 0;

    this.mask = new THREE.TextureLoader().load(mask);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.point = new THREE.Vector2();

    // load iamges
    this.textures = [
      new THREE.TextureLoader().load(img1),
      new THREE.TextureLoader().load(img2),
    ]
    this.addMesh();

    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(this.renderer.domElement);

    this.mouseEffects();
    this.render();
  }

 

  mouseEffects() {

    this.test = new THREE.Mesh(
      new THREE.PlaneGeometry(2000,2000),
      new THREE.MeshBasicMaterial()
    );
    window.addEventListener('mousewheel',(e) => {

      // move mouse by this amount 
      this.move+=e.wheelDeltaY/1000;
    })

    window.addEventListener('mousedown', (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration:1, value: 1,
        ease: "elastic.out(1,0.5)"
      })
    })

    window.addEventListener('mouseup', (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration:1, value: 0,
        ease: "elastic.out(1,0.5)"
      })
    })

    window.addEventListener('mouseover', (e) => {
      gsap.to(this.material.uniforms.mouseHover, {
        duration:1, value: 1
      })
    })

    window.addEventListener('mousemove', (e)=> {
      this.mouse.x = (e.clientX / window.innerWidth )* 2-1;
      this.mouse.y = (e.clientY / window.innerHeight )* 2-1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      

      let intersects = this.raycaster.intersectObjects([this.test])

      this.point.x = intersects[0].point.x;
      this.point.y = intersects[0].point.y *-1;
    },false)
  }


  addMesh() {
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      // uniforms used to pass data to shaders
        uniforms: {
            progress: {type: "f", value: 0},
            t1: {type: "t", value: this.textures[0]},
            t2: {type: "t", value: this.textures[1]},
            mask: {type: 't', value: this.mask},
            move: {type: 'f', value: 0},
            time: {type: 'f', value: 0},
            mouse: {type: 'v2', value: null},
            mousePressed: {type: 'f', value: null},
            mouseHover: {type: 'f', value: null}

        },
        side: DoubleSide,
        transparent: true, 
    })

    let number = 512*512;
    
    this.positions = new THREE.BufferAttribute(new Float32Array(number*3),3)
    this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3),3)
    this.speeds = new THREE.BufferAttribute(new Float32Array(number),1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number),1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number),1);
    this.press = new THREE.BufferAttribute(new Float32Array(number),1);
    // return random between a & b
    function rand(a,b) {
      return a + (b-a)*Math.random();
    }
    let index = 0;
    for (let i = 0; i<512; i++) {
      let posX = i-256;
      for(let j=0; j<512; j++) {
        this.positions.setXYZ(index,posX*2,(j-256)*2,0);
        this.coordinates.setXYZ(index,i,j,0);
        // offset based on camera distance
        this.offset.setX(index,rand(-1000,1000));
        this.speeds.setX(index,rand(0.4,1));
        this.direction.setX(index,Math.random()>0.5?1:-1);
        this.press.setX(index,rand(0.4,1));
        index++;
      }
    }

    // this.geometry = new THREE.PlaneGeometry(1000,1000,10,10);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", this.positions)
    this.geometry.setAttribute("aCoordinates", this.coordinates)
    this.geometry.setAttribute("aSpeed", this.speeds)
    this.geometry.setAttribute("aOffset", this.offset)
    this.geometry.setAttribute("aDirection", this.direction)
    this.geometry.setAttribute("aPress", this.press)

    
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.time++;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.point;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}
new HomeCanvas();
