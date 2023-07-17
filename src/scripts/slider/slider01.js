import * as THREE from "three";

(() => {
  const init = () => {
    // ===============================================
    // # splide
    // ===============================================
    const TARGET = ".section-first-view .splide";
    const SLIDE_DELAY = 5000;
    const OPTIONS = {
      mediaQuery: "min",
      fixedWidth: "100%",
      type: "fade",
      autoplay: true,
      easing: "ease",
      interval: SLIDE_DELAY,
      speed: 800,
      arrows: false,
      pagination: false,
      perMove: 1,
      rewind: true,
      pauseOnHover: false,
      pauseOnFocus: false,
      classes: {
        page: "splide__pagination__page section-first-view__bar",
      },
    };
    const MY_SLIDE = new Splide(TARGET, OPTIONS);

    const ProgressBar = document.getElementsByClassName(
      "section-first-view__bar"
    );

    // ===============================================
    // # updateProgress
    // ===============================================
    const updateProgress = (index) => {
      for (let i = 0; i < ProgressBar.length; i++) {
        ProgressBar[i].children[0].style.transition = "";
        ProgressBar[i].children[0].style.transform = "scaleX(0)";
      }

      setTimeout(() => {
        ProgressBar[index].children[0].style.transition =
          SLIDE_DELAY + "ms linear";
        ProgressBar[index].children[0].style.transform = "scaleX(1)";
      }, 100);
    };
    // ===============================================
    // # shader
    // ===============================================
    const SHADER_TARGET = document.querySelectorAll(".shader-target");

    SHADER_TARGET.forEach((target, index) => {
      // サイズを指定
      const width = window.innerWidth / 2;
      const height = width * (704 / 603);
      // レンダラーを作成
      const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementsByClassName("myCanvas")[index],
      });
      renderer.setSize(width, height);

      // シーンを作成
      const scene = new THREE.Scene();

      // カメラを作成
      const camera = new THREE.PerspectiveCamera(90, width / height);
      camera.position.x = 100;
      // camera.position.z = 0;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const image_src = target.getAttribute("src");
      const texture = new THREE.TextureLoader().load(image_src);
      let targetPercent = 0;

      // uniform変数を定義
      const uniforms = {
        uTime: {
          value: 0.0,
        },
        uMouse: {
          value: new THREE.Vector2(0.5, 0.5),
        },
        uTex: {
          value: texture, // テクスチャ
        },
        uPercent: {
          value: targetPercent,
        },
        dispFactor: { type: "f", value: 0.0 },
        currentImage: { type: "t", value: target },
        nextImage: { type: "t", value: target[index + 1] },
      };

      //vertexShader
      let vertex = `
        varying vec2 vUv;
        // uniform float uFixAspect;

        void main() {
        // 余白ができないようにアスペクト補正
        vUv = uv;
          // vUv = uv - .5;
          //   vUv.y *= uFixAspect;
          // vUv += .5;

          gl_Position = vec4( position, 1.0 );
        }
      `;

      //vertexShader
      let fragment = `
        varying vec2 vUv;

        uniform float uTime;
        uniform float uPercent;
        uniform sampler2D uTex;

        // test
        uniform sampler2D currentImage;
        uniform sampler2D nextImage;
        uniform float dispFactor;

        void main() {
          vec2 uv = vUv;

          // test
          vec4 _currentImage;
          vec4 _nextImage;
          float intensity = 0.3;
          vec4 orig1 = texture2D(currentImage, uv);
          vec4 orig2 = texture2D(nextImage, uv);
          _currentImage = texture2D(currentImage, vec2(uv.x, uv.y + dispFactor * (orig2 * intensity)));
          _nextImage = texture2D(nextImage, vec2(uv.x, uv.y + (1.0 - dispFactor) * (orig1 * intensity)));

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
        transparent: true,
        opacity: 1.0,
      });
      const box = new THREE.Mesh(geometry, mat);
      scene.add(box);

      tick();
      function tick() {
        // レンダリング
        renderer.render(scene, camera);
        const sec = performance.now() / 1000;

        uniforms.uTime.value = sec; // シェーダーに渡す時間を更新
        uniforms.uPercent.value = targetPercent;
        requestAnimationFrame(tick);
      }

      //mouse press & release
      const mousePressed = () => {
        targetPercent = 1.0;
        setTimeout(() => {
          targetPercent = 0.0;
        }, 800);
      };

      MY_SLIDE.on("move", () => {
        mousePressed();
      });
    });

    // ===============================================
    // # setAnimation
    // ===============================================
    const setAnimation = () => {
      MY_SLIDE.on("mounted", () => {
        updateProgress(0);
      });
      MY_SLIDE.on("move", () => {
        updateProgress(MY_SLIDE.index);
      });
      for (let i = 0; i < ProgressBar.length; i++) {
        ProgressBar[i].addEventListener("click", () => {
          MY_SLIDE.go(i);
        });
      }
    };

    ProgressBar != null ? setAnimation() : null;
    MY_SLIDE.mount();
  };

  window.addEventListener("DOMContentLoaded", init);
})();
