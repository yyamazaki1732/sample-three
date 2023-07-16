import * as THREE from "three";

window.addEventListener("DOMContentLoaded", init);

function init() {
  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
  });
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(90, width / height);
  camera.position.x = 100;
  // camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // // 平行光源を作成
  // const directionalLight = new THREE.DirectionalLight(0xffffff);
  // directionalLight.position.set(1, 1, 1);
  // scene.add(directionalLight);

  // マテリアルを作成
  // 平面をつくる（幅, 高さ, 横分割数, 縦分割数）
  const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);
  const mat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("v-shader").textContent,
    fragmentShader: document.getElementById("f-shader").textContent,
    wireframe: false,
  });
  const box = new THREE.Mesh(geometry, mat);
  scene.add(box);

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // レンダリング
    renderer.render(scene, camera);

    requestAnimationFrame(tick);
  }
}
