import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ページの読み込みを待つ
window.addEventListener("DOMContentLoaded", init);

// 非同期処理で待機するのでasync function宣言とする
async function init() {
  // サイズを指定
  const width = 960;
  const height = 540;

  // レンダラーを作成
  const canvasElement = document.querySelector("#myCanvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  // カメラの初期座標を設定
  camera.position.set(1, 1, 1);

  // カメラコントローラーを作成
  const controls = new OrbitControls(camera, canvasElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // 平行光源を作成
  // 上から照らす
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 横からテラス
  const directionalLight2 = new THREE.DirectionalLight(0xffffff);
  directionalLight2.position.set(1, 0, 1);
  scene.add(directionalLight2);

  // GLTF形式のモデルデータを読み込む
  const loader = new GLTFLoader();
  // GLTFファイルのパスを指定
  const gltf = await loader.loadAsync("../public/ToyCar.glb");
  // 読み込み後に3D空間に追加
  const model = gltf.scene;
  scene.add(model);

  model.scale.set(30, 30, 30);

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // レンダリング
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
}
