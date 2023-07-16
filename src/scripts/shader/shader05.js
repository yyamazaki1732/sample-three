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

  const image = document.getElementById("picture").getAttribute("src");
  const texture = new THREE.TextureLoader().load(image);
  let targetPercent = 0;

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

  //vertexShader
  let fragment = `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uPercent;
  uniform sampler2D uTex;
  
  void main() {
    vec2 uv = vUv;
  
    float t = uTime * 6.;
    float amount = uPercent * 0.02;
  
    vec2 uvOffset = vec2( cos( uv.y * 20. + t ), sin( uv.x * 10. - t ) ) * amount;
  
    vec3 color = texture2D( uTex, uv + uvOffset ).rgb;
  
    gl_FragColor = vec4( color, 1.0 );
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
  };
  const mouseReleased = (x, y) => {
    targetPercent = 0.0; // マウスを離したら進捗度の目標値を 0.0 に
  };

  window.addEventListener("mousedown", mousePressed);
  window.addEventListener("mouseup", mouseReleased);

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // レンダリング
    renderer.render(scene, camera);

    const sec = performance.now() / 1000;

    uniforms.uTime.value = sec; // シェーダーに渡す時間を更新
    uniforms.uPercent.value = targetPercent;

    requestAnimationFrame(tick);
  }
}
