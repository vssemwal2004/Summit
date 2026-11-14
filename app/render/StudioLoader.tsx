"use client";

import dynamic from "next/dynamic";

const RenderStudio = dynamic(() => import("@/components/three/RenderStudio"), { ssr: false });

export default function StudioLoader() {
  return <RenderStudio />;
}
