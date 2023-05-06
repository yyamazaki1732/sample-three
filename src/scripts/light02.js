
import * as THREE from 'three'

window.addEventListener('DOMContentLoaded', init);

function init() {
  // サイズを指定
  const width = 960;
  const height = 540;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas'),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // レンダラー：シャドウを有効にする
  renderer.shadowMap.enabled = true;

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(90, width / height);
  camera.position.set(20, 20, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 床を作成
  const meshFloor = new THREE.Mesh(
    new THREE.BoxGeometry(1000, .1, 1000),
    new THREE.MeshStandardMaterial({ color: 0x80ff80, roughness: 0.0 })
  );
  // 影を受け付ける
  meshFloor.receiveShadow = true;
  scene.add(meshFloor);

  // オブジェクトを作成
  const meshKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(4, 2, 100, 16),
    new THREE.MeshStandardMaterial({ color: 0xaa0000, roughness: .0 })
  );
  meshKnot.position.set(0, 10, 0);
  // 影を落とす
  meshKnot.castShadow = true;
  scene.add(meshKnot);

  // 照明を作成
  const light = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 4, 1);
  // ライトに影を有効にする
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  scene.add(light);

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // レンダリング
    renderer.render(scene, camera);

    // 照明の位置を更新
    const t = Date.now() / 500;
    const r = 20.0;
    const lx = r * Math.cos(t);
    const lz = r * Math.sin(t);
    const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
    light.position.set(lx, ly, lz);

    requestAnimationFrame(tick);
  }
}