// ===============================================
// # sample01
// ===============================================
class Slider {
  constructor() {
    this.bindAll();

    this.vert = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    this.frag = `
    varying vec2 vUv;

    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform sampler2D disp;

    uniform float dispPower;
    uniform float intensity;

    uniform vec2 size;
    uniform vec2 res;

    vec2 backgroundCoverUv( vec2 screenSize, vec2 imageSize, vec2 uv ) {
      float screenRatio = screenSize.x / screenSize.y;
      float imageRatio = imageSize.x / imageSize.y;
      vec2 newSize = screenRatio < imageRatio 
          ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
          : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
      vec2 newOffset = (screenRatio < imageRatio 
          ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
          : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
      return uv * screenSize / newSize + newOffset;
    }

    void main() {
      vec2 uv = vUv;
      
      vec4 disp = texture2D(disp, uv);
      vec2 dispVec = vec2(disp.x, disp.y);
      
      vec2 distPos1 = uv + (dispVec * intensity * dispPower);
      vec2 distPos2 = uv + (dispVec * -(intensity * (1.0 - dispPower)));
      
      vec4 _texture1 = texture2D(texture1, distPos1);
      vec4 _texture2 = texture2D(texture2, distPos2);
      
      gl_FragColor = mix(_texture1, _texture2, dispPower);
    }
    `;

    this.el = document.querySelector(".js-slider");
    this.inner = this.el.querySelector(".js-slider__inner");
    this.slides = [...this.el.querySelectorAll(".js-slide")];
    this.bullets = [...this.el.querySelectorAll(".js-slider-bullet")];

    this.renderer = null;
    this.scene = null;
    this.clock = null;
    this.camera = null;

    this.images = [
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg1.jpg",
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg2.jpg",
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg3.jpg",
    ];

    this.data = {
      current: 0,
      next: 1,
      total: this.images.length - 1,
      delta: 0,
    };

    this.state = {
      animating: false,
      text: false,
      initial: true,
    };

    this.textures = null;

    this.init();
  }

  bindAll() {
    ["render", "nextSlide"].forEach((fn) => (this[fn] = this[fn].bind(this)));
  }

  setStyles() {
    this.slides.forEach((slide, index) => {
      if (index === 0) return;

      TweenMax.set(slide, { autoAlpha: 0 });
    });

    this.bullets.forEach((bullet, index) => {
      if (index === 0) return;

      const txt = bullet.querySelector(".js-slider-bullet__text");
      const line = bullet.querySelector(".js-slider-bullet__line");

      TweenMax.set(txt, {
        alpha: 0.25,
      });
      TweenMax.set(line, {
        scaleX: 0,
        transformOrigin: "left",
      });
    });
  }

  cameraSetup() {
    this.camera = new THREE.OrthographicCamera(
      this.el.offsetWidth / -2,
      this.el.offsetWidth / 2,
      this.el.offsetHeight / 2,
      this.el.offsetHeight / -2,
      1,
      1000
    );

    this.camera.lookAt(this.scene.position);
    this.camera.position.z = 1;
  }

  setup() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock(true);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);

    this.inner.appendChild(this.renderer.domElement);
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";

    this.textures = [];
    this.images.forEach((image, index) => {
      const texture = loader.load(image + "?v=" + Date.now(), this.render);

      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      if (index === 0 && this.mat) {
        this.mat.uniforms.size.value = [
          texture.image.naturalWidth,
          texture.image.naturalHeight,
        ];
      }

      this.textures.push(texture);
    });

    this.disp = loader.load(
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/rock-_disp.png",
      this.render
    );
    this.disp.magFilter = this.disp.minFilter = THREE.LinearFilter;
    this.disp.wrapS = this.disp.wrapT = THREE.RepeatWrapping;
  }

  createMesh() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        dispPower: { type: "f", value: 0.0 },
        intensity: { type: "f", value: 0.5 },
        res: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        size: { value: new THREE.Vector2(1, 1) },
        texture1: { type: "t", value: this.textures[0] },
        texture2: { type: "t", value: this.textures[1] },
        disp: { type: "t", value: this.disp },
      },
      transparent: true,
      vertexShader: this.vert,
      fragmentShader: this.frag,
    });

    const geometry = new THREE.PlaneBufferGeometry(
      this.el.offsetWidth,
      this.el.offsetHeight,
      1
    );

    const mesh = new THREE.Mesh(geometry, this.mat);

    this.scene.add(mesh);
  }

  transitionNext() {
    TweenMax.to(this.mat.uniforms.dispPower, 2.5, {
      value: 1,
      ease: Expo.easeInOut,
      onUpdate: this.render,
      onComplete: () => {
        this.mat.uniforms.dispPower.value = 0.0;
        this.changeTexture();
        this.render.bind(this);
        this.state.animating = false;
      },
    });

    const current = this.slides[this.data.current];
    const next = this.slides[this.data.next];

    const currentImages = current.querySelectorAll(".js-slide__img");
    const nextImages = next.querySelectorAll(".js-slide__img");

    const currentText = current.querySelectorAll(".js-slider__text-line div");
    const nextText = next.querySelectorAll(".js-slider__text-line div");

    const currentBullet = this.bullets[this.data.current];
    const nextBullet = this.bullets[this.data.next];

    const currentBulletTxt = currentBullet.querySelectorAll(
      ".js-slider-bullet__text"
    );
    const nextBulletTxt = nextBullet.querySelectorAll(
      ".js-slider-bullet__text"
    );

    const currentBulletLine = currentBullet.querySelectorAll(
      ".js-slider-bullet__line"
    );
    const nextBulletLine = nextBullet.querySelectorAll(
      ".js-slider-bullet__line"
    );

    const tl = new TimelineMax({ paused: true });

    if (this.state.initial) {
      TweenMax.to(".js-scroll", 1.5, {
        yPercent: 100,
        alpha: 0,
        ease: Power4.easeInOut,
      });

      this.state.initial = false;
    }

    tl.staggerFromTo(
      currentImages,
      1.5,
      {
        yPercent: 0,
        scale: 1,
      },
      {
        yPercent: -185,
        scaleY: 1.5,
        ease: Expo.easeInOut,
      },
      0.075
    )
      .to(
        currentBulletTxt,
        1.5,
        {
          alpha: 0.25,
          ease: Linear.easeNone,
        },
        0
      )
      .set(
        currentBulletLine,
        {
          transformOrigin: "right",
        },
        0
      )
      .to(
        currentBulletLine,
        1.5,
        {
          scaleX: 0,
          ease: Expo.easeInOut,
        },
        0
      );

    if (currentText) {
      tl.fromTo(
        currentText,
        2,
        {
          yPercent: 0,
        },
        {
          yPercent: -100,
          ease: Power4.easeInOut,
        },
        0
      );
    }

    tl.set(current, {
      autoAlpha: 0,
    }).set(
      next,
      {
        autoAlpha: 1,
      },
      1
    );

    if (nextText) {
      tl.fromTo(
        nextText,
        2,
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          ease: Power4.easeOut,
        },
        1.5
      );
    }

    tl.staggerFromTo(
      nextImages,
      1.5,
      {
        yPercent: 150,
        scaleY: 1.5,
      },
      {
        yPercent: 0,
        scaleY: 1,
        ease: Expo.easeInOut,
      },
      0.075,
      1
    )
      .to(
        nextBulletTxt,
        1.5,
        {
          alpha: 1,
          ease: Linear.easeNone,
        },
        1
      )
      .set(
        nextBulletLine,
        {
          transformOrigin: "left",
        },
        1
      )
      .to(
        nextBulletLine,
        1.5,
        {
          scaleX: 1,
          ease: Expo.easeInOut,
        },
        1
      );

    tl.play();
  }

  prevSlide() {}

  nextSlide() {
    if (this.state.animating) return;

    this.state.animating = true;

    this.transitionNext();

    this.data.current =
      this.data.current === this.data.total ? 0 : this.data.current + 1;
    this.data.next =
      this.data.current === this.data.total ? 0 : this.data.current + 1;
  }

  changeTexture() {
    this.mat.uniforms.texture1.value = this.textures[this.data.current];
    this.mat.uniforms.texture2.value = this.textures[this.data.next];
  }

  listeners() {
    window.addEventListener("wheel", this.nextSlide, { passive: true });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  init() {
    this.setup();
    this.cameraSetup();
    this.loadTextures();
    this.createMesh();
    this.setStyles();
    this.render();
    this.listeners();
  }
}

// Toggle active link
const links = document.querySelectorAll(".js-nav a");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    links.forEach((other) => other.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});

// Init classes
const slider = new Slider();

// ===============================================
// # sample02
// ===============================================
const displacementSlider = function (opts) {
  let vertex = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;

  let fragment = `
        
        varying vec2 vUv;

        uniform sampler2D currentImage;
        uniform sampler2D nextImage;

        uniform float dispFactor;

        void main() {

            vec2 uv = vUv;
            vec4 _currentImage;
            vec4 _nextImage;
            float intensity = 0.3;

            vec4 orig1 = texture2D(currentImage, uv);
            vec4 orig2 = texture2D(nextImage, uv);
            
            _currentImage = texture2D(currentImage, vec2(uv.x, uv.y + dispFactor * (orig2 * intensity)));

            _nextImage = texture2D(nextImage, vec2(uv.x, uv.y + (1.0 - dispFactor) * (orig1 * intensity)));

            vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);

            gl_FragColor = finalTexture;

        }
    `;

  let images = opts.images,
    image,
    sliderImages = [];
  let canvasWidth = images[0].clientWidth;
  let canvasHeight = images[0].clientHeight;
  let parent = opts.parent;
  let renderWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  let renderHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  let renderW, renderH;

  if (renderWidth > canvasWidth) {
    renderW = renderWidth;
  } else {
    renderW = canvasWidth;
  }

  renderH = canvasHeight;

  let renderer = new THREE.WebGLRenderer({
    antialias: false,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x23272a, 1.0);
  renderer.setSize(renderW, renderH);
  parent.appendChild(renderer.domElement);

  let loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";

  images.forEach((img) => {
    image = loader.load(img.getAttribute("src") + "?v=" + Date.now());
    image.magFilter = image.minFilter = THREE.LinearFilter;
    image.anisotropy = renderer.capabilities.getMaxAnisotropy();
    sliderImages.push(image);
  });

  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0x23272a);
  let camera = new THREE.OrthographicCamera(
    renderWidth / -2,
    renderWidth / 2,
    renderHeight / 2,
    renderHeight / -2,
    1,
    1000
  );

  camera.position.z = 1;

  let mat = new THREE.ShaderMaterial({
    uniforms: {
      dispFactor: { type: "f", value: 0.0 },
      currentImage: { type: "t", value: sliderImages[0] },
      nextImage: { type: "t", value: sliderImages[1] },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0,
  });

  let geometry = new THREE.PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );
  let object = new THREE.Mesh(geometry, mat);
  object.position.set(0, 0, 0);
  scene.add(object);

  let addEvents = function () {
    let pagButtons = Array.from(
      document.getElementById("pagination").querySelectorAll("button")
    );
    let isAnimating = false;

    pagButtons.forEach((el) => {
      el.addEventListener("click", function () {
        if (!isAnimating) {
          isAnimating = true;

          document
            .getElementById("pagination")
            .querySelectorAll(".active")[0].className = "";
          this.className = "active";

          let slideId = parseInt(this.dataset.slide, 10);

          mat.uniforms.nextImage.value = sliderImages[slideId];
          mat.uniforms.nextImage.needsUpdate = true;

          TweenLite.to(mat.uniforms.dispFactor, 1, {
            value: 1,
            ease: "Expo.easeInOut",
            onComplete: function () {
              mat.uniforms.currentImage.value = sliderImages[slideId];
              mat.uniforms.currentImage.needsUpdate = true;
              mat.uniforms.dispFactor.value = 0.0;
              isAnimating = false;
            },
          });

          let slideTitleEl = document.getElementById("slide-title");
          let slideStatusEl = document.getElementById("slide-status");
          let nextSlideTitle = document.querySelectorAll(
            `[data-slide-title="${slideId}"]`
          )[0].innerHTML;
          let nextSlideStatus = document.querySelectorAll(
            `[data-slide-status="${slideId}"]`
          )[0].innerHTML;

          TweenLite.fromTo(
            slideTitleEl,
            0.5,
            {
              autoAlpha: 1,
              y: 0,
            },
            {
              autoAlpha: 0,
              y: 20,
              ease: "Expo.easeIn",
              onComplete: function () {
                slideTitleEl.innerHTML = nextSlideTitle;

                TweenLite.to(slideTitleEl, 0.5, {
                  autoAlpha: 1,
                  y: 0,
                });
              },
            }
          );

          TweenLite.fromTo(
            slideStatusEl,
            0.5,
            {
              autoAlpha: 1,
              y: 0,
            },
            {
              autoAlpha: 0,
              y: 20,
              ease: "Expo.easeIn",
              onComplete: function () {
                slideStatusEl.innerHTML = nextSlideStatus;

                TweenLite.to(slideStatusEl, 0.5, {
                  autoAlpha: 1,
                  y: 0,
                  delay: 0.1,
                });
              },
            }
          );
        }
      });
    });
  };

  addEvents();

  window.addEventListener("resize", function (e) {
    renderer.setSize(renderW, renderH);
  });

  let animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  };
  animate();
};

imagesLoaded(document.querySelectorAll("img"), () => {
  document.body.classList.remove("loading");

  const el = document.getElementById("slider");
  const imgs = Array.from(el.querySelectorAll("img"));
  new displacementSlider({
    parent: el,
    images: imgs,
  });
});
