import * as THREE from "three";

window.addEventListener("DOMContentLoaded", init);

function init() {
  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;
  let rot = 0;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
  });
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(40, width / height);

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // マテリアルを作成
  const geometry = new THREE.TorusGeometry(200, 50, 50);
  const material = new THREE.MeshNormalMaterial();
  const box = new THREE.Mesh(geometry, material);
  scene.add(box);

  // 星屑を作成します (カメラの動きをわかりやすくするため)
  createStarField();

  /** 星屑を作成します */
  function createStarField() {
    // 頂点情報を作詞絵
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = 3000 * (Math.random() - 0.5);
      const y = 3000 * (Math.random() - 0.5);
      const z = 3000 * (Math.random() - 0.5);

      vertices.push(x, y, z);
    }

    // 形状データを作成
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    // マテリアルを作成

    const material = new THREE.PointsMaterial({
      size: 10,
      color: 0xffffff,
    });

    // 物体を作成
    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);
  }

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    rot += 0.5; // 毎フレーム角度を0.5度ずつ足していく
    // ラジアンに変換する
    const radian = (rot * Math.PI) / 180;
    // 角度に応じてカメラの位置を設定
    camera.position.x = 900 * Math.cos(radian);
    camera.position.z = 1000 * Math.sin(radian);
    camera.position.y = 1000 * Math.sin(radian);
    // 原点方向を見つめる
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // レンダリング
    renderer.render(scene, camera);

    requestAnimationFrame(tick);
  }

  // 初期化のために実行
  onResize();
  // リサイズイベント発生時に実行
  window.addEventListener("resize", onResize);

  function onResize() {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}
