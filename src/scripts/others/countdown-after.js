import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

// ===============================================
// # handleFadeIn
// ===============================================
(() => {
  const DURARION = 1;

  const handleFadeIn = () => {
    const HANDLE_FADEIN = document.querySelectorAll(".handle-fadein");
    console.log(HANDLE_FADEIN);
    HANDLE_FADEIN.forEach((element) => {
      const FadeIn = () => {
        gsap.to(element, {
          translateY: 0,
          opacity: 1,
          duration: DURARION,
          ease: "Power2.out",
          overwrite: true,
        });
      };
      const FadeOut = () => {
        gsap.to(element, {
          translateY: "10px",
          opacity: 0,
          overwrite: true,
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 60%",
          ease: "Power4.easeOut",

          onEnter: () => {
            FadeIn();
          },
          onLeaveBack: () => {
            FadeOut();
          },
        },
      });
    });
  };
  // ===============================================
  // # pin
  // ===============================================
  const handleScroll = () => {
    const CONTAINER = document.querySelectorAll(".handle-scroll");

    CONTAINER.forEach((element) => {
      const TEXT_BOX = element.children[0].children[1];
      const IMAGE_BOX = element.children[0].children[2];
      const BG = element.children[0].children[3];

      const HEIGHT = IMAGE_BOX.getBoundingClientRect().height;
      gsap.set(IMAGE_BOX, { translateY: `${HEIGHT}px` });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "center center",
          end: "+=400%",
          scrub: 0.1,
          pin: true,
          markers: true,
        },
      });
      tl.fromTo(
        IMAGE_BOX,
        {
          translateY: `${HEIGHT}px`,
        },
        {
          translateY: `-${HEIGHT + 40}px`,
        }
      );
      window.addEventListener("scroll", () => {
        const START_LINE = window.innerHeight * (3 / 4);
        const END_LINE = window.innerHeight * (1 / 5);

        const fadeInFix = () => {
          gsap.to(TEXT_BOX, {
            opacity: 1,
            duration: 0.5,
            overwrite: true,
          });
          gsap.to(BG, {
            opacity: 1,
            duration: 0.5,
            overwrite: true,
          });
        };
        const fadeOutFix = () => {
          gsap.to(TEXT_BOX, {
            opacity: 0,
            duration: 0.5,
            overwrite: true,
          });
          gsap.to(BG, {
            opacity: 0,
            duration: 0.5,
            overwrite: true,
          });
        };

        IMAGE_BOX.getBoundingClientRect().top <= START_LINE
          ? fadeInFix()
          : IMAGE_BOX.getBoundingClientRect().top > START_LINE
          ? fadeOutFix()
          : null;

        IMAGE_BOX.getBoundingClientRect().bottom <= END_LINE
          ? fadeOutFix()
          : IMAGE_BOX.getBoundingClientRect().bottom <= END_LINE
          ? fadeInFix()
          : null;
      });
    });
  };

  const setAnimation = () => {
    handleScroll();
    handleFadeIn();
  };

  window.addEventListener("DOMContentLoaded", setAnimation);
})();
