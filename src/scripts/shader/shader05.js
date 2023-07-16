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

  const texture = new THREE.TextureLoader().load("../public/whale.jpg");
  let targetPercent = 1;

  // uniform変数を定義
  const uniforms = {
    uTime: {
      value: 0.0,
    },
    uMouse: {
      value: new THREE.Vector2(0.5, 0.5),
    },
    uFixAspect: {
      value: height / width, // 逆アスペクト
    },
    uTex: {
      value: texture, // テクスチャ
    },
    uPercent: {
      value: targetPercent,
    },
  };

  // マテリアルを作成
  // 平面をつくる（幅, 高さ, 横分割数, 縦分割数）
  const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);
  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
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

    const sec = performance.now() / 1000;

    uniforms.uTime.value = sec; // シェーダーに渡す時間を更新

    requestAnimationFrame(tick);
  }
}
