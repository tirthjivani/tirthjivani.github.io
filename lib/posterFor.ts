// Every video in /public/projects ships next to a first-frame still generated
// at upload time (see app/api/studio/upload/route.ts):
//   /projects/outbox.mp4  ->  /projects/outbox-poster.webp
//
// Used as the <video poster> so a tile paints instantly, and as a plain <img>
// wherever a frozen first frame is all that's wanted — a still costs one small
// image request instead of a video decoder plus a range fetch.
export function posterFor(video: string): string {
  return video.replace(/\.[a-z0-9]+$/i, "-poster.webp");
}
