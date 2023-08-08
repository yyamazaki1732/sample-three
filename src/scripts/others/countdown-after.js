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

    HANDLE_FADEIN.forEach((element) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 50%",
          ease: "Power4.easeOut",
        },
      });
      tl.set(element, { opacity: 0 });
      tl.fromTo(
        element,
        {
          y: 50,
          scale: 1,
          opacity: 0,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: DURARION,
          ease: "Power4.out",
        }
      );
    });
  };
  // ===============================================
  // # pin
  // ===============================================
  const handleScroll = () => {
    const CONTAINER = document.querySelectorAll(".handle-scroll");
    // const TEXT_BOX = document.querySelectorAll(".js-text-box");
    // const IMAGE_BOX = document.querySelector(".js-image-box");
    // const HEIGHT = IMAGE_BOX.getBoundingClientRect().height;
    // console.log(CONTAINER[0].children[0].children[0]);
    CONTAINER.forEach((element) => {
      console.log("element", element.children[0].children[0]);

      const TEXT_BOX = element.children[0].children[0];
      const IMAGE_BOX = element.children[0].children[1];
      const HEIGHT = IMAGE_BOX.getBoundingClientRect().height;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "center center",
          end: "+=500%",
          scrub: true,
          pin: true,
        },
      });

      gsap.set(TEXT_BOX, { opacity: 0 });

      tl.fromTo(
        IMAGE_BOX,
        {
          translateY: `${HEIGHT}px`,
        },
        {
          translateY: `-${HEIGHT + 10}px`,
        }
      );

      // gsap.fromTo(
      //   TEXT_BOX,
      //   {
      //     opacity: 1,
      //   },
      //   {
      //     opacity: 0,
      //     duration: DURARION,
      //     scrollTrigger: {
      //       trigger: IMAGE_BOX,
      //       start: "bottom top",
      //     },
      //   }
      // );
      // .to(
      //   TEXT_BOX,
      //   {
      //     opacity: 0,
      //     duration: DURARION,
      //   },
      //   "-=1"
      // );
    });
  };

  const setAnimation = () => {
    handleFadeIn();
    handleScroll();
  };

  window.addEventListener("DOMContentLoaded", setAnimation);
})();
