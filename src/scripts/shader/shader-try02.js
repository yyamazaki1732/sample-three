import { gsap } from "gsap";

gsap.fromTo(
  ".box",
  { yPercent: 120 },
  { yPercent: 0, duration: 1, ease: "Power4.out" }
);
