import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

(() => {
  const DURARION = 0.8;

  // ===============================================
  // # opening
  // ===============================================
  const handleOpening = () => {
    // const SHUTTER = document.querySelectorAll(".opening");
    const VIDEO = document.querySelectorAll(".video-bg");
    const FV = document.getElementsByClassName("fv_layout")[0];

    const SHUTTER = document.getElementsByClassName("opening")[0];
    const WRAPPER = document.getElementsByClassName("fv-wrapper")[0];
    const TEXT = document.getElementsByClassName("fv_container")[0];
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: WRAPPER,
        start: "top top",
        end: "140%",
        scrub: 0,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      TEXT,
      {
        translateY: "140%",
      },
      {
        translateY: 0,
        duration: 1,
      },
      "<"
    );

    tl.scrollTrigger.refresh();

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

      // ScrollTrigger.create({
      //   trigger: element,
      //   start: "center center",
      //   end: () => `${HEIGHT}px`,
      //   scrub: 0,
      //   pin: true,
      // });
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
          markers: true,
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
          // anticipatePin: 1,
          toggleClass: { targets: BG_M, className: "is-show" },
        });
      };
      const handleLogoWomen = () => {
        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "bottom center",
          // anticipatePin: 1,
          toggleClass: { targets: BG_W, className: "is-show" },
        });
      };

      index == 0 ? handleLogoMen() : handleLogoWomen();
    });
  };

  const setAnimation = () => {
    handleOpening();
    handleScroll();
    handleBg();
    handleFadeIn();
  };

  window.addEventListener("DOMContentLoaded", setAnimation);
})();
