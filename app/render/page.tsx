import { notFound } from "next/navigation";
import StudioLoader from "./StudioLoader";

export const metadata = { robots: { index: false, follow: false } };

/** Dev-only still renderer for the artist's-impression images. Not available in production builds. */
export default function RenderPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StudioLoader />;
}
