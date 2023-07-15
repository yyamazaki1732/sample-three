import * as THREE from "three";

window.addEventListener("DOMContentLoaded", init);
function init() {
  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;
  const mouse = new THREE.Vector2(0, 0);
  let increment_scrollY = 0;
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
    // alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成

  const fov = 45;
  const fovRad = (fov / 2) * (Math.PI / 180); // 視野角をラジアンに変換
  const dist = height / 2 / Math.tan(fovRad); // ウィンドウぴったりのカメラ距離

  const camera = new THREE.PerspectiveCamera(fov, width / height, 1, dist * 2);
  camera.position.z = dist;

  // ドーナツを作成
  const geometry = new THREE.TorusKnotGeometry(100, 40, 200, 200);
  // マテリアルを作成
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  // メッシュを作成
  const mesh = new THREE.Mesh(geometry, material);

  // 3D空間にメッシュを追加
  scene.add(mesh);

  // 平行光源
  const spotLight = new THREE.SpotLight(0xff000f);
  spotLight.position.set(0, 0, dist);
  scene.add(spotLight);

  // ポイント光源
  //   const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
  //   scene.add(pointLight);
  //   const pointLightHelper = new THREE.PointLightHelper(pointLight, 30);
  //   scene.add(pointLightHelper);

  //   mousemove
  function mouseMoved(x, y) {
    mouse.x = x - width / 2; // 原点を中心に持ってくる
    mouse.y = -y + height / 2; // 軸を反転して原点を中心に持ってくる

    spotLight.position.x = mouse.x;
    spotLight.position.y = mouse.y;
  }

  window.addEventListener("mousemove", (e) => {
    mouseMoved(e.clientX, e.clientY);
  });

  //   scroll
  function scrolled(y) {
    increment_scrollY = y;
  }
  scrolled(window.scrollY);

  window.addEventListener("scroll", () => {
    scrolled(window.scrollY);
  });

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // メッシュを回転させる
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    mesh.rotation.z += 0.01;
    mesh.position.y = increment_scrollY;
    // ライトを周回させる
    //   pointLight.position.set(
    //     500 * Math.sin(1000 / 500),
    //     500 * Math.sin(1000 / 1000),
    //     500 * Math.cos(1000 / 500)
    //   );

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
