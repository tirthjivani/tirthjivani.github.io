import { InfiniteCanvas } from "@/components/InfiniteCanvas";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Photos — Tirth Jivani",
};

export default function PhotosPage() {
  return (
    <>
      <Navbar />
      <main>
        <InfiniteCanvas
          imageRootPath="/photos"
          numberOfImages={12}
          imageSize="20vw"
          gap="8vw"
        />
      </main>
    </>
  );
}
