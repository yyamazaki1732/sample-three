import * as THREE from "three";

const canvasEl = document.getElementById("webgl-canvas");
const canvasSize = {
  w: window.innerWidth,
  h: window.innerHeight,
};

const renderer = new THREE.WebGLRenderer({ canvas: canvasEl });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasSize.w, canvasSize.h);

// ウィンドウとwebGLの座標を一致させるため、描画がウィンドウぴったりになるようカメラを調整
const fov = 60; // 視野角
const fovRad = (fov / 2) * (Math.PI / 180);
const dist = canvasSize.h / 2 / Math.tan(fovRad);
const camera = new THREE.PerspectiveCamera(
  fov,
  canvasSize.w / canvasSize.h,
  0.1,
  1000
);
camera.position.z = dist;

const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();
const texture = loader.load("https://source.unsplash.com/whOkVvf0_hU/");

const uniforms = {
  uTexture: { value: texture },
  uImageAspect: { value: 1920 / 1280 }, // 画像のアスペクト
  uPlaneAspect: { value: 800 / 500 }, // プレーンのアスペクト
};
const geo = new THREE.PlaneBufferGeometry(800, 500, 100, 100);
const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById("v-shader").textContent,
  fragmentShader: document.getElementById("f-shader").textContent,
});

const mesh = new THREE.Mesh(geo, mat);

scene.add(mesh);

// 毎フレーム呼び出す
const loop = () => {
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
};

const main = () => {
  window.addEventListener("load", () => {
    loop();
  });
};

main();
