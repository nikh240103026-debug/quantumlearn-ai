import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    icons: [{ src: "/images/quantumlearn-logo.png", sizes: "any", type: "image/png" }],
  };
}
