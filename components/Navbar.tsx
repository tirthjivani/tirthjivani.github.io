"use client";

import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < 24) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="grid grid-cols-12 items-center px-[10px] py-[10px] text-[16px] leading-none text-white">
        <div className="col-start-1 col-span-2 font-bold">Tirth Jivani</div>

        <div className="col-start-3 col-span-4 flex gap-[20px]">
          <span>List</span>
          <span className="text-white/30">Grid</span>
        </div>

        <div className="col-start-7 col-span-5 flex gap-[20px]">
          <a href="#outbox-labs">Work</a>
          <span className="text-white/30">Photos</span>
          <span className="text-white/30">Archives</span>
          <span className="text-white/30">Information</span>
        </div>

        <div className="col-start-12 col-span-1 flex justify-end gap-[20px]">
          <span className="text-white/30">IN</span>
          <span className="text-white/30">LN</span>
          <span className="text-white/30">X</span>
        </div>
      </div>
    </header>
  );
}
