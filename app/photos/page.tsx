import { InfiniteCanvas } from "@/components/InfiniteCanvas";
import { Navbar } from "@/components/Navbar";
import { PHOTO_PATHS } from "@/data/photos";

export const metadata = {
  title: "Photos - Tirth Jivani",
};

export default function PhotosPage() {
  return (
    <>
      <Navbar />
      <main>
        <InfiniteCanvas images={PHOTO_PATHS} imageSize="20vw" gap="8vw" />
      </main>
    </>
  );
}
