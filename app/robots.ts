import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/auth/", "/user/", "/caregiver/"],
    },
    sitemap: "https://cura-sync.my/sitemap.xml",
  };
}
