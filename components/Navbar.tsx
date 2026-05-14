"use client";

export type ViewMode = "list" | "grid";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="grid grid-cols-12 items-center px-[20px] py-[20px] text-[16px] leading-none tracking-[-0.03em] text-white">
        <div className="col-start-1 col-span-3 font-bold">Tirth Jivani</div>

        <div className="col-start-7 col-span-3 flex gap-[10px]">
          <a href="#outbox-labs">Work</a>
          <span className="text-white/30">Photos</span>
          <span className="text-white/30">Archive</span>
          <span className="text-white/30">Info</span>
        </div>

        <div className="col-start-10 col-span-3 flex justify-end gap-[10px] text-white/30">
          <a
            href="https://www.instagram.com/tirth.design/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/tirthjivani/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60"
          >
            Linkedin
          </a>
          <a
            href="https://x.com/tirthjivani"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60"
          >
            The X
          </a>
        </div>
      </div>
    </header>
  );
}
