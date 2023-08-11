import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);
(() => {
  const DURARION = 0.8;
  const VIDEO = document.getElementsByClassName("video-bg")[0];
  const FV = document.getElementsByClassName("fv")[0];
  const TITLE = document.getElementsByClassName("fv_title")[0];
  const SHUTTER = document.getElementsByClassName("opening")[0];
  const WRAPPER = document.getElementsByClassName("fv-wrapper")[0];
  const TEXT = document.getElementsByClassName("fv_container")[0];
  const mediaQuery = window.matchMedia("(min-width: 960px)");

  // ===============================================
  // # opening
  // ===============================================
  const handleOpening = () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: FV,
        start: "top top",
        end: "bottom top",
        scrub: 0,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        markers: true,
      },
    });

    tl.fromTo(
      TEXT,
      {
        opacity: 0,
        translateY: "140%",
      },
      { opacity: 1, translateY: 0, duration: 1 },
      "<"
    );

    tl.scrollTrigger.refresh();

    ScrollTrigger.create({
      trigger: ".app",
      start: "center top",
      toggleClass: { targets: VIDEO, className: "is-hidden" },
    });

    gsap
      .timeline()
      .to(SHUTTER, {
        translateY: "-120%",
        duration: 0.4,
        ease: "Power4.easeIn",
        delay: 0.6,
      })
      .fromTo(
        VIDEO,
        {
          translateY: "5%",
          scale: 1.05,
        },
        {
          translateY: 0,
          scale: 1,
          duration: 1.0,
        },
        "-=.2"
      )
      .fromTo(
        FV,
        {
          translateY: "5%",
          opacity: 0,
        },
        {
          translateY: 0,
          opacity: 1,
          duration: DURARION,
        },
        "<"
      );
  };
  // ===============================================
  // # handleScroll
  // ===============================================
  const handleScroll = () => {
    const CONTAINER = document.querySelectorAll(".js-text-box");

    CONTAINER.forEach((element) => {
      const IMAGE_BOX = element.nextElementSibling;
      const HEIGHT = IMAGE_BOX.getBoundingClientRect().height;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "center center",
          end: () => `${HEIGHT}px`,
          scrub: 0,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      tl.scrollTrigger.refresh();
    });
  };

  // ===============================================
  // # handleFadeIn
  // ===============================================

  const handleFadeIn = () => {
    const HANDLE_FADEIN = document.querySelectorAll(".handle-fadein");

    HANDLE_FADEIN.forEach((element) => {
      const START_POS = element.classList.contains("start-delay")
        ? "85%" // normal
        : "65%"; // start-delay

      const FadeIn = () => {
        gsap.to(element, {
          translateY: 0,
          opacity: 1,
          duration: DURARION,
          ease: "Power4.out",
          overwrite: true,
        });
      };
      const FadeOut = () => {
        gsap.to(element, {
          translateY: "10%",
          opacity: 0,
          overwrite: true,
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: `top ${START_POS}`,
          ease: "Power4.ease",
          invalidateOnRefresh: true,
          onEnter: () => {
            FadeIn();
          },
          onLeaveBack: () => {
            FadeOut();
          },
        },
      });

      tl.scrollTrigger.refresh();
    });
  };
  // ===============================================
  // # handleBg
  // ===============================================
  const handleBg = () => {
    const CONTAINER = document.querySelectorAll(".handle-bg");
    const BG_M = document.getElementsByClassName("js-bg")[0].children[0];
    const BG_W = document.getElementsByClassName("js-bg")[0].children[1];

    CONTAINER.forEach((element, index) => {
      const handleLogoMen = () => {
        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "bottom center",
          toggleClass: { targets: BG_M, className: "is-show" },
        });
      };
      const handleLogoWomen = () => {
        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "bottom center",
          toggleClass: { targets: BG_W, className: "is-show" },
        });
      };

      index == 0 ? handleLogoMen() : handleLogoWomen();
    });
  };

  const handleClick = () => {
    const TARGET = document.getElementsByClassName("notes")[0];
    const handleClickButton = document.getElementsByClassName(
      "fv_container_scrolldown"
    )[0];
    handleClickButton.addEventListener("click", () => {
      gsap.to(window, {
        duration: 0,
        marker: true,
        scrollTo: {
          y: () => TARGET.getBoundingClientRect().bottom,
          offsetY: 0,
        },
      });
    });
  };

  const setAnimation = () => {
    handleOpening();
    mediaQuery.matches ? handleScroll() : null;
    handleBg();
    handleFadeIn();
    handleClick();
  };

  window.addEventListener("DOMContentLoaded", setAnimation);
})();
