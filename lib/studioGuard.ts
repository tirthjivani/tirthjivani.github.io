import { headers } from "next/headers";

// Studio routes are dev-only and localhost-only. They write to the seeds
// JSON and uploads directory; never expose this surface in production.
export async function isStudioAllowed(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") return false;
  const h = await headers();
  const host = (h.get("host") ?? "").toLowerCase();
  // Match localhost, 127.0.0.1, [::1] on any port.
  return (
    host.startsWith("localhost:") ||
    host === "localhost" ||
    host.startsWith("127.0.0.1:") ||
    host === "127.0.0.1" ||
    host.startsWith("[::1]:") ||
    host === "[::1]"
  );
}
