import { gsap } from "gsap/all";
import * as THREE from "three";

window.addEventListener("DOMContentLoaded", init);

function init() {
  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    alpha: 0,
  });
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(90, width / height);
  camera.position.x = 100;
  // camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const image = document.getElementsByClassName("picture");
  const imageAttribute = image[0].getAttribute("src");
  const texture = new THREE.TextureLoader().load(imageAttribute);
  const currentImage = new THREE.TextureLoader().load(
    image[0].getAttribute("src")
  );
  const nextImage = new THREE.TextureLoader().load(
    image[1].getAttribute("src")
  );
  let targetPercent = 0;
  let targetDispFactor = 0;

  // uniform変数を定義
  const uniforms = {
    uTime: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uFixAspect: { value: height / width }, // 逆アスペクト
    uTex: { value: texture }, // テクスチャ
    uPercent: { value: targetPercent },
    currentImage: { value: currentImage },
    nextImage: { value: nextImage },
    dispFactor: { value: targetDispFactor },
  };

  //vertexShader
  let vertex = `
	varying vec2 vUv;
	uniform float uFixAspect;

	void main() {
	// 余白ができないようにアスペクト補正
		vUv = uv - .5;
	  	vUv.y *= uFixAspect;
		vUv += .5;

		gl_Position = vec4( position, 1.0 );
	}
`;

  //fragmentShader
  let fragment = `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uPercent;
  uniform sampler2D uTex;

  //test
  uniform sampler2D currentImage;
  uniform sampler2D nextImage;
  uniform float dispFactor;
  //test end

  void main() {
    vec2 uv = vUv;

    //test start
    vec4 _currentImage;
    vec4 _nextImage;
    float intensity = .05;

    vec4 orig1 = texture2D(currentImage, uv);
    vec4 orig2 = texture2D(nextImage, uv);
    
    float dispHor1 = dispFactor * (orig1.g * intensity);
    float dispVer1 = dispFactor * (orig1.g * intensity) ;

    float dispHor2 =  (1.0 - dispFactor) * (orig2.g * intensity);
    float dispVer2 =  (1.0 - dispFactor) * (orig2.g * intensity);

    _currentImage = texture2D(currentImage, vec2(uv.x + dispHor1, uv.y ));
    _nextImage =    texture2D(nextImage,    vec2(uv.x + dispHor2, uv.y  ));

    vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);

    //test end


    float t = uTime * 6.;
    float amount = uPercent * 0.02;
  
    vec2 uvOffset = vec2( cos( uv.y * 20. + t ), sin( uv.x * 10. - t ) ) * amount;
  
    vec3 color = texture2D( uTex, uv + uvOffset ).rgb;
  
    // gl_FragColor = vec4( color, 1.0 );
    gl_FragColor = finalTexture;
  }
`;

  // マテリアルを作成
  // 平面をつくる（幅, 高さ, 横分割数, 縦分割数）
  const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);
  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    wireframe: false,
  });
  const box = new THREE.Mesh(geometry, mat);
  scene.add(box);

  //mouse press & release
  const mousePressed = (x, y) => {
    targetPercent = 1.0; // マウスを押したら進捗度の目標値を 1.0 に
    targetDispFactor = 1.0;
  };
  const mouseReleased = (x, y) => {
    targetPercent = 0.0; // マウスを離したら進捗度の目標値を 0.0 に
    targetDispFactor = 0.0;
  };

  mousePressed();
  let flag = 0;
  setInterval(() => {
    flag += 1;
    flag % 2 === 0 ? mousePressed() : mouseReleased();
  }, 2000);

  const easingFactor = 0.05;
  let currentDispFactor = 0.0;

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // イージングによる目標値への近づき具合を計算
    let diff = targetDispFactor - currentDispFactor;
    let delta = diff * easingFactor;
    currentDispFactor += delta;

    // レンダリング
    renderer.render(scene, camera);

    const sec = performance.now() / 1000;

    uniforms.uTime.value = sec; // シェーダーに渡す時間を更新
    uniforms.uPercent.value = targetPercent;
    uniforms.dispFactor.value = currentDispFactor;

    requestAnimationFrame(tick);
  }
  tick();
}
